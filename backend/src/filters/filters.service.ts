import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllFiltersQueryDto } from './dto/find-all-filters-query.dto';
import { FilterKind, FilterType } from '@prisma/client';
import { FilterDto } from './dto/filter.dto';
import { FilterGroupWithMappingDto } from '../search/dto/filters.dto';
import { validate } from 'class-validator';
import { CategoryDto } from './dto/category.dto';
import { BaseGenericFilterIds } from './constants/base-filters.constants';

@Injectable()
export class FiltersService implements OnModuleInit {
  constructor(private prismaService: PrismaService) {}

  async onModuleInit() {
    await this.prismaService.category.createMany({
      data: [
        { name: 'Watches', userId: '1', id: 'watches' },
        { name: 'Bottles', userId: '1', id: 'bottles' },
        { name: 'Jewellery', userId: '1', id: 'jewellery' },
        { name: 'Writing Instruments', userId: '1', id: 'writing-instruments' },
        { name: 'Generic', userId: '1', id: 'generic' },
      ],
      skipDuplicates: true,
    });

    /** @todo add a function that checks that these values ar present in the DB */
    await this.prismaService.filterOrFilterGroup.createMany({
      data: [
        {
          name: 'Patent repository',
          id: BaseGenericFilterIds.PATENT_REPOSITORY,
          kind: FilterKind.FILTER,
          type: FilterType.SINGLE_CHOICE,
          options: ['HK', 'IFPI', 'INPI', 'CN', 'USPTO', 'OHMI', 'OMPI'],
          categoryId: 'generic',
        },
        {
          name: 'Year',
          id: BaseGenericFilterIds.YEAR,
          kind: FilterKind.FILTER,
          type: FilterType.YEAR,
          categoryId: 'generic',
        },
        {
          name: 'Filename',
          id: 'filename',
          kind: FilterKind.FILTER,
          type: FilterType.TEXT,
          categoryId: 'generic',
        },
        {
          name: 'Creation date',
          id: BaseGenericFilterIds.CREATION_DATE,
          kind: FilterKind.FILTER,
          type: FilterType.DATE,
          categoryId: 'generic',
        },
        {
          name: 'Region',
          id: BaseGenericFilterIds.REGION,
          kind: FilterKind.FILTER,
          type: FilterType.SINGLE_CHOICE,
          options: [
            'UE',
            'Monde',
            'France',
            'Hong Kong',
            'Suisse',
            'Chine',
            'USA',
          ],
          categoryId: 'generic',
        },
      ],
      skipDuplicates: true,
    });

    // todo : run idempotent scripts that set the filters from the directory structure in s3
  }

  create(
    { kind, name, parentId, options, type, categoryId }: CreateFilterDto,
    id?: string,
  ) {
    const data = {
      id,
      kind,
      name,
      parentId: parentId ?? null,
      categoryId: categoryId === '' ? null : categoryId,
      ...(kind === FilterKind.FILTER && {
        options,
        type,
      }),
    };

    return this.prismaService.filterOrFilterGroup.create({
      data,
    });
  }

  filtersMapping: Record<string, { path: Array<string>; name: string }> = {
    root: { path: ['root'], name: 'All filters' },
  };

  async getFiltersTree(categoryId: string): Promise<FilterGroupWithMappingDto> {
    const [[filterGroup], [{ mapping }]]: any = await Promise.all([
      this.prismaService.$queryRaw`
            SELECT 'root' AS id,
                  'All filters' AS name,
                  'GROUP' AS kind,
                  'will-be-replaced-by-code' as "categoryId",
                  GET_FILTERS_TREE_WITH_OPTIONS(NULL) AS children
            `,
      this.prismaService.$queryRaw`
            WITH RECURSIVE filter_path AS
              (SELECT 'root' AS id,
                      'All filters' AS name,
                      array['root'] AS path,
                      '' AS "categoryId",
                      NULL AS type,
                      'GROUP' AS kind
              UNION ALL 
              SELECT id,
                     name, 
                     array['root', id] AS path,
                     "categoryId",
                     type,
                     kind
              FROM "FilterOrFilterGroup"
              WHERE "parentId" IS NULL
              UNION ALL
              SELECT f.id,
                     f.name,
                     fp.path || f.id,
                     f."categoryId",
                     f.type,
                     f.kind
              FROM "FilterOrFilterGroup" f
              JOIN filter_path fp ON f."parentId" = fp.id)
            SELECT json_object_agg(
                                   id, 
                                   json_build_object('name', name, 
                                                     'path', path,
                                                     'type', type,
                                                     'kind', kind,
                                                     'categoryId', "categoryId"
                                                     )
                                  ) AS mapping
            FROM filter_path fp
            `,
    ]);

    const result = new FilterGroupWithMappingDto({ filterGroup, mapping });

    result.filterGroup.children = result.filterGroup.children.filter(
      (f) => f.categoryId === categoryId,
    );

    result.filterGroup.categoryId = categoryId;

    result.filterGroup.children = result.filterGroup.children.sort((f1, f2) => {
      return f1.name.localeCompare(f2.name);
    });

    const validationErrors = await validate(result);

    if (validationErrors.length > 0) {
      throw new InternalServerErrorException(
        'The server could not retrieve the filters successfully. Please inform the developers.',
      );
    }

    return result;
  }

  async getCategories(): Promise<CategoryDto[]> {
    const categories = await this.prismaService.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return categories;
  }

  async findAll(query: FindAllFiltersQueryDto): Promise<FilterDto[]> {
    const where = query
      ? {
          ...(query.query && {
            name: {
              contains: query.query,
            },
          }),
          ...(query.groupsOnly === 'true' && {
            kind: FilterKind.GROUP,
          }),
          ...(query.categoryId === 'all'
            ? {}
            : query.categoryId
              ? {
                  OR: [
                    {
                      categoryId: query.categoryId,
                    },
                  ],
                }
              : {}),
        }
      : undefined;

    const filters = await this.prismaService.filterOrFilterGroup.findMany({
      where,
    });

    return filters;
  }

  findOne(id: number) {
    return `This action returns a #${id} filter`;
  }

  async update(id: string, { name, newOptions, parentId }: UpdateFilterDto) {
    const currentFilterOrGroupInDb =
      await this.prismaService.filterOrFilterGroup.findUnique({
        where: {
          id,
        },
      });

    if (parentId && parentId !== 'no-parent') {
      const newParentGroup =
        await this.prismaService.filterOrFilterGroup.findUnique({
          where: {
            id: parentId,
          },
        });

      if (currentFilterOrGroupInDb.categoryId !== newParentGroup.categoryId) {
        throw new BadRequestException(
          'The new parent group must be in the same category as the filter or filter group being modified',
        );
      }
    }

    // TODO: update the mappings of the ES indexe(s) // ??

    return this.prismaService.filterOrFilterGroup.update({
      data: {
        name,
        parentId: parentId === 'no-parent' ? null : parentId,
        options: {
          push: newOptions,
        },
      },
      where: {
        id,
      },
    });
  }

  async remove(id: string) {
    return this.prismaService.filterOrFilterGroup.delete({
      where: { id },
    });
  }
}
