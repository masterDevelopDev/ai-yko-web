import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import {
  Category,
  DateFilterSearchMode,
  DocumentStatus,
  FilterType,
  FilterValue,
  Image,
  TextFilterSearchMode,
} from '@prisma/client';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { FilterOrFilterGroupDto } from './filters.dto';
import { DocumentWithCategoryAndFilterValuesAndChoices } from '../../search-engine/search-engine.service';
import { Transform, Type } from 'class-transformer';
import {
  BaseSearchQueryFilterValue,
  SearchQueryDateFilterValue,
  SearchQueryFilterValueDto,
  SearchQueryIntegerFilterValue,
  SearchQueryMultichoiceFilterValue,
  SearchQuerySinglechoiceFilterValue,
  SearchQueryTextFilterValue,
  SearchQueryYearFilterValue,
} from './search-query.dto';

export class ImageDto implements Image {
  @IsNumber()
  id: number;

  @IsString()
  @IsUrl()
  url: string;

  @IsString()
  documentId: string;

  @IsNumber()
  searchId: number;

  @IsArray()
  @IsNumber(undefined, { each: true })
  embedding: number[];
}

export class FilterValueDto implements FilterValue {
  @IsNumber() id: number;

  @IsString() documentId: string;

  @IsString() filterId: string;

  @IsEnum(FilterType)
  @ApiProperty({
    enum: FilterType,
  })
  type: FilterType;

  @IsString() searchQueryId: number;

  @IsString() stringValue: string;

  @IsString() secondStringValue: string;

  @IsNumber() integerValue: number;

  @IsNumber() secondIntegerValue: number;

  @IsEnum(TextFilterSearchMode)
  @ApiProperty({
    enum: TextFilterSearchMode,
  })
  textMode: TextFilterSearchMode;

  @IsEnum(DateFilterSearchMode)
  @ApiProperty({
    enum: DateFilterSearchMode,
  })
  dateMode: DateFilterSearchMode;

  @IsBoolean() negate: boolean;

  @IsString({ each: true }) choiceIds: string[];
}

export class SearchResultDto
  implements
    Omit<DocumentWithCategoryAndFilterValuesAndChoices, 'filterValues'>
{
  @IsString()
  id: string;

  @IsString()
  filename: string;

  @IsString()
  @IsUrl()
  url: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  categoryId: string;

  @IsNumber()
  @IsOptional()
  score?: number;

  @IsObject()
  category: Category;

  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ArrayUnique((o) => o?.filterId)
  @IsOptional()
  @ValidateNested({ each: true })
  @ApiProperty({
    /** TODO METTRE L'INFO Qu'il s'agit d'un array d'objets*/
    oneOf: [
      { $ref: getSchemaPath(SearchQueryDateFilterValue) },
      { $ref: getSchemaPath(SearchQueryYearFilterValue) },
      { $ref: getSchemaPath(SearchQueryTextFilterValue) },
      { $ref: getSchemaPath(SearchQueryIntegerFilterValue) },
      { $ref: getSchemaPath(SearchQueryMultichoiceFilterValue) },
      {
        $ref: getSchemaPath(SearchQuerySinglechoiceFilterValue),
      },
    ],
  })
  @Type(() => BaseSearchQueryFilterValue, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        { value: SearchQueryTextFilterValue, name: FilterType.TEXT },
        { value: SearchQueryYearFilterValue, name: FilterType.YEAR },
        { value: SearchQueryIntegerFilterValue, name: FilterType.INTEGER },
        { value: SearchQueryDateFilterValue, name: FilterType.DATE },
        {
          value: SearchQueryMultichoiceFilterValue,
          name: FilterType.MULTI_CHOICE,
        },
        {
          value: SearchQuerySinglechoiceFilterValue,
          name: FilterType.SINGLE_CHOICE,
        },
      ],
    },
  })
  filterValues: SearchQueryFilterValueDto[];

  @IsArray()
  @ValidateNested({ each: true })
  images: ImageDto[];

  @IsString()
  creatorId: string;

  @IsString()
  editorId: string;

  @IsEnum(DocumentStatus)
  status: DocumentStatus;
}

export class ValueCount {
  @IsString()
  value: string;

  @IsNumber()
  count: number;
}

export class RefinementFilterDto {
  @ValidateNested()
  filter: FilterOrFilterGroupDto;

  @IsArray()
  @ValidateNested({ each: true })
  counts: ValueCount[];
}

export class SearchResultsWithRefinementFiltersDto {
  @ValidateNested({ each: true })
  @IsArray()
  searchResults: SearchResultDto[];

  @IsNumber()
  total: number;

  @IsBoolean()
  moreThan: boolean;

  @ValidateNested({ each: true })
  @IsArray()
  refinementFilters: RefinementFilterDto[];

  @IsBoolean()
  isSavedSearch: boolean;
}
