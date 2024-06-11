import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { IamModule } from './iam/iam.module';
import { UserModule } from './user/user.module';
import { SearchModule } from './search/search.module';
import * as Joi from 'joi';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { EmailModule } from './email/email.module';
import { FiltersModule } from './filters/filters.module';
import { SearchEngineModule } from './search-engine/search-engine.module';
import { DocumentModule } from './document/document.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'staging', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(4000),
        DATABASE_URL: Joi.string().required(),

        JWT_SECRET: Joi.string().required(),
        JWT_TOKEN_AUDIENCE: Joi.string().default('localhost:4000'),
        JWT_TOKEN_ISSUER: Joi.string().default('localhost:4000'),
        JWT_ACCESS_TOKEN_TTL: Joi.number().default(3600),
        JWT_REFRESH_TOKEN_TTL: Joi.number().default(86400),

        AWS_PDF_DOCUMENTS_BUCKET: Joi.string().required(),
        AWS_EXTRACTED_IMAGES_BUCKET: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().default('eu-west-1'),
        AWS_EXTRACTION_MODEL_SAGEMAKER_ENDPOINT_NAME: Joi.string().required(),
        AWS_VECTORIZATION_MODEL_SAGEMAKER_ENDPOINT_NAME:
          Joi.string().required(),

        ELASTIC_CLOUD_ID: Joi.string().required(),
        ELASTIC_USERNAME: Joi.string().required(),
        ELASTIC_PASSWORD: Joi.string().required(),

        SMTP_USER: Joi.string().required(),
        SMTP_PASSWORD: Joi.string().required(),
        SMTP_HOST: Joi.string().domain().required(),
        SMTP_FROM_EMAIL: Joi.string().email().required(),

        FRONTEND_URL: Joi.string().uri({}).required(),

        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.string().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    FastifyMulterModule,
    PrismaModule,
    IamModule,
    UserModule,
    SearchModule,
    EmailModule,
    FiltersModule,
    SearchEngineModule,
    DocumentModule,
    AdminModule,
    RedisModule,
  ],
})
export class AppModule {}
