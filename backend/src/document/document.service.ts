import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { File } from '@nest-lab/fastify-multer';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { InjectAws } from 'aws-sdk-v3-nest';
import { PrismaService } from '../prisma/prisma.service';
import { SearchEngineService } from '../search-engine/search-engine.service';
import {
  DateFilterSearchMode,
  FilterType,
  TextFilterSearchMode,
} from '@prisma/client';
import {
  DocumentDateFilterValue,
  DocumentFilterValueDto,
  DocumentIntegerFilterValue,
  DocumentMultichoiceFilterValue,
  DocumentSinglechoiceFilterValue,
  DocumentTextFilterValue,
  DocumentYearFilterValue,
} from './dto/document-filter-values.dto';
import { SearchResultDto } from '../search/dto/search-result.dto';

@Injectable()
export class DocumentService {
  private logger = new Logger(DocumentService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectAws(S3Client) private readonly s3: S3Client,
    private readonly prismaService: PrismaService,
    private readonly searchEngineService: SearchEngineService,
  ) {}

  async findDocumentNamesInBucketForMigration() {
    const BUCKET_NAME = 'sample-design-documents';

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1000,
    });

    let isTruncated = true;
    const result = [];

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } =
        await this.s3.send(command);

      result.push(...Contents.map(({ Key }) => Key));

      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }

    return result;
  }

  async getPdfFileFromS3(key: string): Promise<string> {
    const BUCKET_NAME = this.configService.get('AWS_PDF_DOCUMENTS_BUCKET');

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const s3Object = await this.s3.send(command);

    const base64File = await s3Object.Body.transformToString('base64');

    return base64File;
  }

  formatDocumentFilterValueDtoForDatabase(f: DocumentFilterValueDto) {
    let integerValue: number;
    let stringValue: string;
    let choiceIds: string[] = [];
    let textMode: TextFilterSearchMode;
    let dateMode: DateFilterSearchMode;

    switch (f.type) {
      case FilterType.DATE:
        const v = f.value as DocumentDateFilterValue;
        dateMode = DateFilterSearchMode.EQUAL;
        stringValue = v.date;
        break;

      case FilterType.YEAR:
        const y = f.value as DocumentYearFilterValue;
        integerValue = y.year;
        dateMode = DateFilterSearchMode.EQUAL;
        break;

      case FilterType.TEXT:
        const t = f.value as DocumentTextFilterValue;
        textMode = TextFilterSearchMode.EQUAL;
        stringValue = t.text;
        break;

      case FilterType.INTEGER:
        const n = f.value as DocumentIntegerFilterValue;
        integerValue = n.integer;
        break;

      case FilterType.MULTI_CHOICE:
        const mc = f.value as DocumentMultichoiceFilterValue;
        choiceIds = mc.choiceIds;
        break;

      case FilterType.SINGLE_CHOICE:
        const sc = f.value as DocumentSinglechoiceFilterValue;
        choiceIds = [sc.choiceId];
        break;

      default:
        throw new Error('filter type not recognized ' + f.type);
    }

    return {
      filterId: f.filterId.replace(/\./g, '_'),
      stringValue,
      integerValue,
      choiceIds,
      type: f.type,
      textMode,
      dateMode,
    };
  }

  async create(
    { categoryId, filters }: CreateDocumentDto,
    file: File,
    creatorId: string,
  ) {
    const filename = file.originalname;

    if (typeof filters === 'string') {
      filters = JSON.parse(filters);
    }

    const filterIds = filters.map(({ filterId }) => filterId);

    const hasYearSpecified = filterIds.includes('year');
    const hasDepotSpecified = filterIds.includes('depot');

    if (!(hasYearSpecified && hasDepotSpecified)) {
      throw new BadRequestException({
        message: 'Both year and patent repository must be specified',
        hasYearSpecified,
        hasDepotSpecified,
      });
    }

    const existingDocumentInDb = await this.prismaService.document.findUnique({
      where: { filename },
    });

    if (existingDocumentInDb) {
      await this.prismaService.document.delete({
        where: {
          filename,
        },
      });

      await this.searchEngineService.deleteDocument(
        existingDocumentInDb.id,
        existingDocumentInDb.categoryId,
      );
    }

    const bucketName = this.configService.get('AWS_PDF_DOCUMENTS_BUCKET');
    const awsRegion = this.configService.get('AWS_REGION');

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Body: file.buffer,
      Key: filename,
    });

    const result = await this.s3.send(command);

    if (result.$metadata.httpStatusCode !== 200) {
      throw new InternalServerErrorException(
        'File could not be uploaded successfully',
      );
    }

    const document = await this.prismaService.document.create({
      include: { filterValues: true, category: true, images: true },
      data: {
        filename,
        creatorId,
        url: `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${filename}`,
        categoryId,
        filterValues: {
          createMany: {
            data: filters.map(this.formatDocumentFilterValueDtoForDatabase),
          },
        },
      },
    });

    this.searchEngineService.indexDocument(document, file);

    return { documentId: document.id };
  }

  async getIndexationStatus(id: string) {
    const { status } = await this.prismaService.document.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        status: true,
      },
    });

    return { status };
  }

  findAll() {
    return `This action returns all document`;
  }

  findOne(id: string) {
    return `This action returns a #${id} document`;
  }

  /**
   * @warning BE EXTREMELY CAREFUL WHEN YOU MODIFY THE LOGIC OF THIS FUNCTION
   * BE SURE YOU UNDERSTAND IT WELL
   */
  async update(
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ): Promise<SearchResultDto[]> {
    // TODO add the user id condition in the query ?

    // todo: check that documents are of the same category etc.

    const updatedDocuments = await this.prismaService.$transaction(
      async (tx) => {
        await Promise.all(
          updateDocumentDto.ids.map(async (id) => {
            const newOrUpdatedFilterValues = updateDocumentDto.filters.map(
              this.formatDocumentFilterValueDtoForDatabase,
            );

            if (!updateDocumentDto.deletePreviousFilters) {
              const oldFilterValues = await tx.filterValue.findMany({
                where: {
                  documentId: id,
                },
              });

              const newOrUpdatedFilterValuesFilterIds =
                newOrUpdatedFilterValues.map(({ filterId }) => filterId);

              const oldFilterValuesToKeep = oldFilterValues.filter(
                (fv) =>
                  !newOrUpdatedFilterValuesFilterIds.includes(fv.filterId),
              );

              newOrUpdatedFilterValues.push(...oldFilterValuesToKeep);
            }

            await tx.filterValue.deleteMany({
              where: {
                documentId: id,
              },
            });

            await tx.filterValue.createMany({
              data: newOrUpdatedFilterValues.map((fv) => ({
                ...fv,
                documentId: id,
              })),
            });

            await tx.document.update({
              data: {
                editorId: userId,
              },
              where: {
                id,
              },
            });
          }),
        );

        const updatedDocuments = await tx.document.findMany({
          include: {
            category: true,
            images: true,
            filterValues: true,
          },
          where: {
            id: {
              in: updateDocumentDto.ids,
            },
          },
        });

        return updatedDocuments;
      },
    );

    await Promise.all(
      updatedDocuments.map((document) =>
        this.searchEngineService.updateDocumentFilters(document),
      ),
    );

    return updatedDocuments.map((result) => ({
      ...result,
      filterValues: result.filterValues.map(
        this.searchEngineService
          .formatFilterValueFromDbToSearchQueryFilterValueDto,
      ),
    }));
  }

  async markAsFavorite(userId: string, documentId: string) {
    await this.prismaService.favoriteDocument.create({
      data: {
        documentId,
        userId,
      },
    });
  }

  async removeFromFavorites(userId: string, documentId: string) {
    await this.prismaService.favoriteDocument.delete({
      where: {
        userId_documentId: {
          documentId,
          userId,
        },
      },
    });
  }

  async retrieveFavoritedDocumentIds(userId: string) {
    const r = await this.prismaService.favoriteDocument.findMany({
      select: {
        documentId: true,
      },
      where: {
        userId,
      },
    });

    return r.map(({ documentId }) => documentId);
  }

  async retrieveFavoritedDocuments(userId: string): Promise<SearchResultDto[]> {
    const ids = await this.retrieveFavoritedDocumentIds(userId);

    const { results } = await this.searchEngineService.searchByIds(ids);

    return results.map((result) => ({
      ...result,
      filterValues: result.filterValues.map(
        this.searchEngineService
          .formatFilterValueFromDbToSearchQueryFilterValueDto,
      ),
    }));
  }

  /**
   *
   * @todo Delete files from s3 ?
   *
   * @param ids ids of documents to delete
   * @returns nothing
   */
  async remove(ids: string[]) {
    const documents = await this.prismaService.document.findMany({
      where: {
        id: { in: ids },
      },
    });

    await Promise.all(
      documents.map(({ id, categoryId }) =>
        this.searchEngineService.deleteDocument(id, categoryId),
      ),
    );

    await this.prismaService.document.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
