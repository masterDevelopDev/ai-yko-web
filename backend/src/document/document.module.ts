import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { AwsSdkModule } from 'aws-sdk-v3-nest';
import { SearchEngineModule } from '../search-engine/search-engine.module';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
  imports: [
    SearchEngineModule,
    AwsSdkModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        new S3Client({
          region: configService.get('AWS_REGION'),
        }),
      clientType: S3Client,
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
})
export class DocumentModule {}
