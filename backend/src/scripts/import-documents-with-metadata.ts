import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { DocumentService } from '../document/document.service';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

import slugify from 'slugify';
import { FilterType } from '@prisma/client';
import {
  DocumentIntegerFilterValue,
  DocumentMultichoiceFilterValue,
  DocumentSinglechoiceFilterValue,
  DocumentTextFilterValue,
  DocumentYearFilterValue,
} from '../document/dto/document-filter-values.dto';
import { Logger } from '@nestjs/common';

dayjs.extend(customParseFormat);

const CATEGORY_TO_DOCUMENT_METADATA = {
  bottles: 'data-initial-migration/bottles_documents_metadata.json',
  watches: 'data-initial-migration/watches_documents_metadata.json',
  jewellery: 'data-initial-migration/jewellery_documents_metadata.json',
  'writing-instruments':
    'data-initial-migration/writing_documents_metadata.json',
};

const parseCreatedAtAsDate = (s: string): string =>
  dayjs(s, 'M/D/YYYY H:mm', 'fr').toISOString();

const parseModifiedAtAsDate = (s: string): string =>
  dayjs(s, 'YYYY-MM-DD HH:mm:ss', 'fr').toISOString();

const importDocumentMetadata = async (
  categoryId: keyof typeof CATEGORY_TO_DOCUMENT_METADATA,
) => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const documentService = app.get(DocumentService);
  const prismaService = app.get(PrismaService);
  const configService = app.get(ConfigService);

  const fileNames =
    await documentService.findDocumentNamesInBucketForMigration();

  const metadata = JSON.parse(
    await readFile(
      join(__dirname, CATEGORY_TO_DOCUMENT_METADATA[categoryId]),
      'utf8',
    ),
  );

  const bucketName = configService.get('AWS_PDF_DOCUMENTS_BUCKET');
  const awsRegion = configService.get('AWS_REGION');

  const people = [
    ...new Set(metadata.map(({ editor }) => editor)),
    ...new Set(metadata.map(({ author }) => author)),
  ];

  await prismaService.user.createMany({
    data: people.map((name: string) => ({
      email: name + '@migration.com',
      firstName: name,
      lastName: '',
      password: '',
      id: slugify(name),
    })),
    skipDuplicates: true,
  });

  for (const element of metadata) {
    try {
      if (!fileNames.includes(element.filename)) {
        continue;
      }

      const filterValuesWithType = element.filterValues.map((fv) => {
        let type: FilterType;

        if (typeof fv.values[0] === 'number') {
          type = FilterType.INTEGER;
        } else {
          type = FilterType.MULTI_CHOICE;
        }

        if (type === FilterType.MULTI_CHOICE) {
          return {
            type,
            filterId: fv.filterId.replace(/\./g, '_') as string,
            value: { choiceIds: fv.values } as DocumentMultichoiceFilterValue,
          };
        }

        return {
          type,
          filterId: fv.filterId.replace(/\./g, '_') as string,
          value: { integer: fv.values[0] } as DocumentIntegerFilterValue,
        };
      });

      const createdAt = parseCreatedAtAsDate(element.created);
      const updatedAt = parseModifiedAtAsDate(element.modified);

      try {
        const allFilterValues = [
          ...filterValuesWithType,

          {
            type: FilterType.SINGLE_CHOICE,
            filterId: 'depot' as string,
            value: {
              choiceId: element.depot,
            } as DocumentSinglechoiceFilterValue,
          },
          {
            type: FilterType.SINGLE_CHOICE,
            filterId: 'region' as string,
            value: {
              choiceId: element.region,
            } as DocumentSinglechoiceFilterValue,
          },
          {
            type: FilterType.TEXT,
            filterId: 'filename' as string,
            value: {
              text: element.filename,
            } as DocumentTextFilterValue,
          },
        ];

        if (typeof element.year === 'number') {
          allFilterValues.push({
            type: FilterType.YEAR,
            filterId: 'year' as string,
            value: {
              year: element.year,
            } as DocumentYearFilterValue,
          });
        }

        const data = {
          createdAt,
          updatedAt,
          filename: element.filename,
          creatorId: slugify(element.author ?? '1'),
          editorId: slugify(element.editor ?? '1'),
          url: `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${element.filename}`,
          categoryId,

          filterValues: {
            createMany: {
              data: allFilterValues.map(
                documentService.formatDocumentFilterValueDtoForDatabase,
              ),
            },
          },
        };

        try {
          const document = await prismaService.document.upsert({
            include: { filterValues: true, category: true },

            update: data,

            where: {
              filename: element.filename,
            },

            create: data,
          });

          Logger.log('INSERTED DOC ' + document.id);
        } catch {
          Logger.error(
            'ERROR WITH DATA' +
              JSON.stringify(data, null, 3) +
              'ERROR WITH DATA',
          );

          throw new Error('PRISMA ERROR');
        }
      } catch (e) {
        Logger.error('ERROR WITH ELEMENT:' + JSON.stringify(element, null, 4));

        continue;
      }
    } catch (error) {
      Logger.error(
        'ERROR WITH ELEMENT' +
          JSON.stringify(element, null, 2) +
          String(error) +
          'ERROR WITH ELEMENT, will continue',
      );

      continue;
    }
  }

  await app.close();
};

const importDM = async () => {
  await importDocumentMetadata('bottles');
  await importDocumentMetadata('watches');
  await importDocumentMetadata('writing-instruments');
  await importDocumentMetadata('jewellery');
};

importDM();
