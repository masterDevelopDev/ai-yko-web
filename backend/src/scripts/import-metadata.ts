import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import METADATA_WATCHES from './metadata_watches_update.json';
import METADATA_JEWELLERY from './metadata_jewellery_update.json';
import METADATA_BOTTLES from './metadata_bottles_update.json';
import METADATA_WRITING_INSTRUMENTS from './metadata_writing_update.json';
import { FiltersService } from '../filters/filters.service';

const CATEGORY_TO_METADATA = {
  watches: METADATA_WATCHES,
  jewellery: METADATA_JEWELLERY,
  bottles: METADATA_BOTTLES,
  'writing-instruments': METADATA_WRITING_INSTRUMENTS,
};

const importMetadata = async (categoryId: string) => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const filterService = app.get(FiltersService);

  const createFiltersAndGroupsRecursively = async (f: any) => {
    if (f.kind === 'GROUP') {
      await filterService.create(
        {
          kind: 'GROUP',
          name: f.name,
          categoryId,
          parentId: f.parentId ?? null,
        },
        f.id,
      );

      for (const c of f.children) {
        await createFiltersAndGroupsRecursively(c);
      }
    } else if (f.kind === 'FILTER') {
      await filterService.create(
        {
          kind: 'FILTER',
          name: f.name,
          type: f.type,
          categoryId,
          parentId: f.parentId ?? null,
          options: f.values,
        },
        f.id.toString().replace(/\./g, '_'),
      );
    }
  };

  for (const group of CATEGORY_TO_METADATA[categoryId].filtersOrFilterGroups) {
    createFiltersAndGroupsRecursively(group);
  }
};

importMetadata('watches');
importMetadata('jewellery');
importMetadata('bottles');
importMetadata('writing-instruments');
