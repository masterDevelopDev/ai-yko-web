import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { DocumentService } from '../document/document.service';

import { SearchEngineService } from '../search-engine/search-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentStatus } from '@prisma/client';
import { Logger } from '@nestjs/common';

const batchIndexDocuments = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const documentService = app.get(DocumentService);
  const prismaService = app.get(PrismaService);
  const searchEngineService = app.get(SearchEngineService);

  const documents = await prismaService.document.findMany({
    include: { filterValues: true, category: true, images: true },
    where: {
      status: {
        not: DocumentStatus.INDEXED,
      },
    },
  });

  let c = 0;

  for (const document of documents) {
    Logger.log(
      `Indexing document ${document.filename} of category ${document.categoryId}`,
    );

    c += 1;

    try {
      const pdfBase64String = await documentService.getPdfFileFromS3(
        document.filename,
      );

      await searchEngineService.indexDocument(
        document,
        undefined,
        pdfBase64String,
      );

      if (c % 30 === 0) {
        Logger.log('WAITING 30 SECONDS');

        await new Promise((resolve) => {
          setTimeout(resolve, 20_000);
        });
      }
    } catch {
      Logger.error(document.filename);
    }
  }
};

batchIndexDocuments();
