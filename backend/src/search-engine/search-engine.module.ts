import { Module } from '@nestjs/common';
import { SearchEngineService } from './search-engine.service';
import { ConfigService } from '@nestjs/config';
import { AwsSdkModule } from 'aws-sdk-v3-nest';
import { SageMakerRuntimeClient } from '@aws-sdk/client-sagemaker-runtime';
import { ELASTICSEARCH_CLIENT_KEY } from './search-engine.constants';
import { Client } from '@elastic/elasticsearch';

@Module({
  providers: [
    SearchEngineService,
    {
      provide: ELASTICSEARCH_CLIENT_KEY,
      useFactory: async (configService: ConfigService) => {
        const client = new Client({
          cloud: {
            id: configService.get('ELASTIC_CLOUD_ID'),
          },
          auth: {
            username: configService.get('ELASTIC_USERNAME'),
            password: configService.get('ELASTIC_PASSWORD'),
          },
        });

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [SearchEngineService],
  imports: [
    AwsSdkModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        new SageMakerRuntimeClient({
          region: configService.get('AWS_REGION'),
        }),
      clientType: SageMakerRuntimeClient,
      inject: [ConfigService],
    }),
  ],
})
export class SearchEngineModule {}
