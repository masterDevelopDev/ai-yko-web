import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SearchService } from './search.service';
import { AwsSdkModule } from 'aws-sdk-v3-nest';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { SearchEngineModule } from '../search-engine/search-engine.module';
import { EmailModule } from '../email/email.module';
import { DocumentModule } from '../document/document.module';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [
    EmailModule,
    DocumentModule,
    SearchEngineModule,
    PrismaModule,
    AwsSdkModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        new S3Client({
          region: configService.get('AWS_REGION'),
        }),
      clientType: S3Client,
      inject: [ConfigService],
    }),
  ],
})
export class SearchModule {}
