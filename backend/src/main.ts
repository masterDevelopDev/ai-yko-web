import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';
import { FilterMappingEntry } from './search/dto/filters.dto';
import {
  SearchQueryDateFilterValue,
  SearchQueryIntegerFilterValue,
  SearchQueryMultichoiceFilterValue,
  SearchQuerySinglechoiceFilterValue,
  SearchQueryTextFilterValue,
  SearchQueryYearFilterValue,
} from './search/dto/search-query.dto';
import {
  DocumentDateFilterValue,
  DocumentIntegerFilterValue,
  DocumentMultichoiceFilterValue,
  DocumentSinglechoiceFilterValue,
  DocumentTextFilterValue,
  DocumentYearFilterValue,
} from './document/dto/document-filter-values.dto';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );

  app
    .enableCors
    /** { origin: app.get(ConfigService).get('AUTHORIZED_ORIGINS').split(','), } */
    ();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  app.register(fastifyCookie);

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('AI-KYO')
    .setDescription('AI-KYO API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('authentication')
    .build();
  const API_DOCS_PATH = 'api-docs';
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      FilterMappingEntry,

      SearchQueryMultichoiceFilterValue,
      SearchQueryDateFilterValue,
      SearchQueryYearFilterValue,
      SearchQueryTextFilterValue,
      SearchQuerySinglechoiceFilterValue,
      SearchQueryIntegerFilterValue,

      DocumentDateFilterValue,
      DocumentYearFilterValue,
      DocumentTextFilterValue,
      DocumentSinglechoiceFilterValue,
      DocumentMultichoiceFilterValue,
      DocumentIntegerFilterValue,
    ],
  });
  SwaggerModule.setup(API_DOCS_PATH, app, document);

  const port = app.get(ConfigService).get('PORT');

  await app.listen(port, '0.0.0.0');

  Logger.log(`Backend app is listening on port ${port}`);
  Logger.log(
    `API docs are available at http://localhost:${port}/${API_DOCS_PATH}`,
  );
  Logger.log(
    `OpenAPI Specification as JSON: http://localhost:${port}/${API_DOCS_PATH}-json`,
  );
}

bootstrap();
