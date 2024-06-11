import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { File } from '@nest-lab/fastify-multer';
import {
  SearchQueryDateFilterValue,
  SearchQueryDto,
  SearchQueryFilterValueDto,
  SearchQueryIntegerFilterValue,
  SearchQueryMultichoiceFilterValue,
  SearchQuerySinglechoiceFilterValue,
  SearchQueryTextFilterValue,
  SearchQueryYearFilterValue,
} from './dto/search-query.dto';
import { SearchResultsWithRefinementFiltersDto } from './dto/search-result.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { FilterNotFoundException } from './exceptions/filter-not-found.exception';
import { DocumentExportRequestDto } from './dto/document-export.dto';
import { PDFDocument } from 'pdf-lib';
import { InjectAws } from 'aws-sdk-v3-nest';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { ExceptionChecker } from './exceptions/exception.checker';
import { RecordNotFoundException } from './exceptions/record-not-found.exception';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
import { SearchEngineService } from '../search-engine/search-engine.service';
import { v4 as uuidv4 } from 'uuid';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  DateFilterSearchMode,
  FilterType,
  MonitoringFrequency,
  Prisma,
  TextFilterSearchMode,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import {
  getOneDayAgo,
  getOneMonthAgo,
  getOneWeekAgo,
  isTodaySameMonthdayAsDate,
  isTodaySameWeekdayAsDate,
} from '../common/date.utils';
import { SavedSearchDto } from './dto/saved-search.dto';
import { BaseGenericFilterIds } from '../filters/constants/base-filters.constants';

@Injectable()
export class SearchService {
  private logger = new Logger(SearchService.name);

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private emailService: EmailService,
    private searchEngineService: SearchEngineService,
    @InjectAws(S3Client) private readonly s3: S3Client,
  ) {}

  async uploadFileToS3(buffer: Buffer, key: string): Promise<string> {
    const bucketName = this.configService.get('AWS_PDF_DOCUMENTS_BUCKET');
    const awsRegion = this.configService.get('AWS_REGION');

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Body: buffer,
      Key: key,
    });

    const result = await this.s3.send(command);

    if (result.$metadata.httpStatusCode !== 200) {
      throw new InternalServerErrorException(
        'File could not be uploaded successfully',
      );
    }

    return `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${key}`;
  }

  generateS3Key(file: File) {
    return uuidv4() + '.' + file.mimetype.split('.').at(-1);
  }

  async uploadImages(files: File[]) {
    const urls = await Promise.all(
      files.map((file) =>
        this.uploadFileToS3(file.buffer, this.generateS3Key(file)),
      ),
    );

    return urls;
  }

  formatSearchQueryFilterValueDtoForDatabase(f: SearchQueryFilterValueDto) {
    let integerValue: number;
    let secondIntegerValue: number;
    let stringValue: string;
    let secondStringValue: string;
    let choiceIds: string[] = [];
    let textMode: TextFilterSearchMode;
    let dateMode: DateFilterSearchMode;

    switch (f.type) {
      case FilterType.DATE:
        const v = f as SearchQueryDateFilterValue;
        stringValue = v.firstDate;
        dateMode = v.mode;
        if (v.secondDate) {
          secondStringValue = v.secondDate;
        }
        break;

      case FilterType.YEAR:
        const y = f as SearchQueryYearFilterValue;
        integerValue = y.firstYear;
        dateMode = y.mode;
        if (y.secondYear) {
          secondIntegerValue = y.secondYear;
        }
        break;

      case FilterType.TEXT:
        const t = f as SearchQueryTextFilterValue;
        textMode = t.mode;
        stringValue = t.text;
        break;

      case FilterType.INTEGER:
        const n = f as SearchQueryIntegerFilterValue;
        integerValue = n.firstInteger;
        /** @todo rename to dateOrIntegerMode */
        dateMode = n.mode;
        if (n.secondInteger) {
          secondIntegerValue = n.secondInteger;
        }
        break;

      case FilterType.MULTI_CHOICE:
        const mc = f as SearchQueryMultichoiceFilterValue;
        choiceIds = mc.choiceIds;
        break;

      case FilterType.SINGLE_CHOICE:
        const sc = f as SearchQuerySinglechoiceFilterValue;
        choiceIds = [sc.choiceId];
        break;

      default:
        throw new Error('filter type not recognized ');
    }

    return {
      filterId: f.filterId,

      stringValue,
      secondStringValue,

      integerValue,
      secondIntegerValue,

      choiceIds,
      type: f.type,

      textMode,
      dateMode,
    };
  }

  async checkIfSavedSearch() {
    return false;
  }

  async search(
    searchQueryDto: SearchQueryDto,
    user: ActiveUserData,
    imageFiles: File[],
  ): Promise<SearchResultsWithRefinementFiltersDto> {
    if (typeof searchQueryDto.filterValues === 'string') {
      searchQueryDto.filterValues = JSON.parse(searchQueryDto.filterValues);
    }

    if (typeof searchQueryDto.savedImages === 'string') {
      searchQueryDto.savedImages = JSON.parse(searchQueryDto.savedImages);
    }

    const embeddings = searchQueryDto.savedImages?.map((si) => si.embedding);

    const [{ results, total, moreThan, refinementFilters }, isSavedSearch] =
      await Promise.all([
        this.searchEngineService.search(searchQueryDto, imageFiles, embeddings),
        this.checkIfSavedSearch(),
      ]);

    return {
      searchResults: results.map((result) => ({
        ...result,
        filterValues: result.filterValues.map(
          this.searchEngineService
            .formatFilterValueFromDbToSearchQueryFilterValueDto,
        ),
      })),
      refinementFilters,
      isSavedSearch,
      total,
      moreThan,
    };
  }

  async getSavedSearches(user: ActiveUserData) {
    const ss = await this.prismaService.searchQuery.findMany({
      include: {
        filterValues: true,
        images: true,
      },
      where: {
        userId: user.sub,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ss.map((s) => ({
      ...s,
      filterValues: s.filterValues.map(
        this.searchEngineService
          .formatFilterValueFromDbToSearchQueryFilterValueDto,
      ),
    }));
  }

  async getSavedSearch(user: ActiveUserData, id: number) {
    const search = await this.prismaService.searchQuery.findFirst({
      include: {
        filterValues: true,
        images: true,
      },
      where: {
        userId: user.sub,
        id,
      },
    });

    if (!search) throw new NotFoundException();

    return {
      ...search,
      filterValues: search.filterValues.map(
        this.searchEngineService
          .formatFilterValueFromDbToSearchQueryFilterValueDto,
      ),
    };
  }

  convertToNullIfEmptyString(s: string) {
    return s === '' ? null : s;
  }

  getExtensionFromMimeType(mimeType: string) {
    const mimeParts = mimeType.split('/');
    if (mimeParts.length === 2) {
      return mimeParts[1];
    }
    return '';
  }

  async uploadJunkImages(user: ActiveUserData, imageFiles: File[]) {
    await this.searchEngineService.deactivateImagesOfDocumentsThatMatchEmbeddings(
      imageFiles,
    );
  }

  async saveSearchQuery(
    searchQueryDto: SearchQueryDto,
    user: ActiveUserData,
    imageFiles: File[],
  ) {
    const imageDataForCreation: { url: string; embedding: number[] }[] = [];

    if (typeof searchQueryDto.savedImages === 'string') {
      searchQueryDto.savedImages = JSON.parse(searchQueryDto.savedImages);
    }

    if (imageFiles.length > 0) {
      const imageNames = imageFiles.map((file) => {
        const extension = this.getExtensionFromMimeType(file.mimetype);

        const uniqueId = uuidv4().replace(/-/g, '');

        return `${uniqueId}.${extension}`;
      });

      const [imageUrls, { Embeddings: embeddings }] = await Promise.all([
        Promise.all(
          imageFiles.map(async (file, idx) => {
            const url = await this.uploadFileToS3(file.buffer, imageNames[idx]);
            return url;
          }),
        ),
        this.searchEngineService.getImageEmbeddings(imageFiles),
      ]);

      for (let i = 0; i < imageUrls.length; i++) {
        imageDataForCreation.push({
          url: imageUrls[i],
          embedding: embeddings[i],
        });
      }
    }

    if (searchQueryDto.savedImages.length > 0) {
      imageDataForCreation.push(
        ...searchQueryDto.savedImages.map(({ url, embedding }) => ({
          url,
          embedding,
        })),
      );
    }

    // todo: si filtres il y a, verifier que tous matchent la meme category? or it will slow the search?

    const name = 'saved-search-' + Date.now();

    if (typeof searchQueryDto.filterValues === 'string') {
      searchQueryDto.filterValues = JSON.parse(searchQueryDto.filterValues);
    }

    const hasImages =
      imageFiles.length > 0 || searchQueryDto.savedImages.length > 0;

    try {
      const createdSearch = await this.prismaService.searchQuery.create({
        include: {
          images: true,
        },
        data: {
          userId: user.sub,
          name,
          text: this.convertToNullIfEmptyString(searchQueryDto.text),
          categoryId: this.convertToNullIfEmptyString(
            searchQueryDto.categoryId,
          ),
          ...(searchQueryDto.filterValues && {
            filterValues: {
              createMany: {
                data: searchQueryDto.filterValues.map(
                  this.formatSearchQueryFilterValueDtoForDatabase,
                ),
              },
            },
          }),
          ...(hasImages && {
            images: {
              createMany: {
                data: imageDataForCreation,
              },
            },
          }),
        },
      });

      return { name: createdSearch.name };
    } catch (e) {
      this.logger.error(`Exception: `, e);

      if (ExceptionChecker.IS_FOREIGN_KEY_EXCEPTION(e)) {
        throw new FilterNotFoundException();
      }
      throw e;
    }
  }

  async checkNewSavedSearcheResults(
    savedSearch: Prisma.SearchQueryGetPayload<{
      include: { user: true; images: true; category: true; filterValues: true };
    }>,
    fromDate: string,
  ) {
    const searchQueryDto = new SearchQueryDto();

    searchQueryDto.categoryId = savedSearch.categoryId ?? '';

    searchQueryDto.text = savedSearch.text;

    const embeddings = savedSearch.images.map(({ embedding }) => embedding);

    searchQueryDto.filterValues = savedSearch.filterValues.map(
      this.searchEngineService
        .formatFilterValueFromDbToSearchQueryFilterValueDto,
    );

    searchQueryDto.filterValues.push({
      type: FilterType.DATE,
      filterId: BaseGenericFilterIds.CREATION_DATE,
      mode: DateFilterSearchMode.AFTER_OR_EQUAL,
      firstDate: fromDate,
    });

    const newResults = await this.searchEngineService.search(
      searchQueryDto,
      [],
      embeddings,
    );

    if (newResults.results.length === 0) return;

    const url = new URL(this.configService.get('FRONTEND_URL'));

    url.pathname = '/search';

    url.search = new URLSearchParams({
      saved_search_id: String(savedSearch.id),
    }).toString();

    const message = `Monitored search report:
    
    \n\nSearch name: ${savedSearch.name}.

    \n\nNew results: ${newResults.results.length}  new results

    \n\n See your saved search: ${url}
    
    `;

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Saved search</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #333;
            }
            p {
                color: #666;
            }
            a {
                color: #007bff;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Monitored search report:</h1>
            <p>
                Search name: <strong>${savedSearch.name}</strong>.
            </p>
            <p>
                New results: <strong>${newResults.results.length}</strong> new results.
            </p>
            <p>
                See your saved search: <a href="${url}">${url}</a>.
            </p>
        </div>
    </body>
    </html>`;

    this.emailService.sendEmail({
      text: message,
      html,
      subject: 'AIYKO - Monitored search',
      to: 'icpro@pm.me', // savedSearch.user.email,
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    disabled: false,
  })
  async monitorSavedSearches() {
    this.logger.log('Monitoring saved searches');

    const monitoredSavedSearches =
      await this.prismaService.searchQuery.findMany({
        where: {
          isMonitored: true,
        },
        include: {
          images: true,
          filterValues: true,
          user: true,
          category: true,
        },
      });

    for (const search of monitoredSavedSearches) {
      switch (search.monitoringFrequency) {
        case MonitoringFrequency.DAILY:
          this.checkNewSavedSearcheResults(search, getOneDayAgo());
          break;

        case MonitoringFrequency.WEEKLY:
          if (!isTodaySameWeekdayAsDate(search.createdAt)) {
            continue;
          }

          this.checkNewSavedSearcheResults(search, getOneWeekAgo());

          break;

        case MonitoringFrequency.MONTHLY:
          if (!isTodaySameMonthdayAsDate(search.createdAt)) {
            continue;
          }

          this.checkNewSavedSearcheResults(search, getOneMonthAgo());

          break;

        default:
          break;
      }
    }
  }

  async exportSearchResult(
    exportingSearchResultsDto: DocumentExportRequestDto,
  ): Promise<string> {
    /** @todo in the future, check that user is authorized to export these ids */
    const documents = await this.prismaService.document.findMany({
      where: {
        id: {
          in: exportingSearchResultsDto.documentIds,
        },
      },
    });

    const getObjectCommand = (s3Key: string) =>
      new GetObjectCommand({
        Bucket: this.configService.get('AWS_PDF_DOCUMENTS_BUCKET'),
        Key: s3Key,
      });

    const s3Objects = await Promise.all(
      documents.map((document) =>
        this.s3.send(getObjectCommand(document.filename)),
      ),
    );

    const s3ObjectsBody = await Promise.all(
      s3Objects.map((object) => object.Body.transformToByteArray()),
    );

    const mergedPdf = await PDFDocument.create();

    for (const pdfBytes of s3ObjectsBody) {
      const pdf = await PDFDocument.load(pdfBytes);

      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    const uintArray = await mergedPdf.save();

    const buffer = Buffer.from(uintArray);

    const key = uuidv4() + '.pdf';

    const url = await this.uploadFileToS3(buffer, key);

    return url;
  }

  async getSavedSearchQueries(user: ActiveUserData): Promise<SavedSearchDto[]> {
    const res = await this.prismaService.searchQuery.findMany({
      where: { userId: user.sub },
      include: {
        filterValues: true,
        images: true,
      },
    });

    return res.map((search) => ({
      ...search,
      filterValues: search.filterValues.map(
        this.searchEngineService
          .formatFilterValueFromDbToSearchQueryFilterValueDto,
      ),
    }));
  }

  async deleteSavedSearchQuery(user: ActiveUserData, searchId: number) {
    try {
      await this.prismaService.searchQuery.delete({
        where: {
          userId: user.sub,
          id: searchId,
        },
      });
    } catch (e) {
      if (ExceptionChecker.IS_RECORD_NOT_EXISTING_EXCEPTION(e)) {
        throw new RecordNotFoundException(searchId);
      }
      throw e;
    }
  }

  async updateSavedSearch(
    user: ActiveUserData,
    searchId: number,
    body: UpdateSavedSearchDto,
  ) {
    try {
      await this.prismaService.searchQuery.update({
        where: {
          userId: user.sub,
          id: searchId,
        },
        data: body,
      });
    } catch (e) {
      if (ExceptionChecker.IS_RECORD_NOT_EXISTING_EXCEPTION(e)) {
        throw new RecordNotFoundException(searchId);
      }
      throw e;
    }
  }
}
