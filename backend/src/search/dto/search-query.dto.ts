import {
  ArrayUnique,
  Equals,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  DateFilterSearchMode,
  FilterType,
  TextFilterSearchMode,
} from '@prisma/client';
import { File } from '@nest-lab/fastify-multer';
import { ImageDto } from './search-result.dto';

export class BaseSearchQueryFilterValue {
  @IsString()
  filterId: string;

  @IsEnum(FilterType)
  @ApiProperty({
    enum: FilterType,
  })
  type: FilterType;
}

export class SearchQueryYearFilterValue extends BaseSearchQueryFilterValue {
  @Equals(FilterType.YEAR)
  type: 'YEAR';

  @IsEnum(DateFilterSearchMode)
  @IsOptional()
  @ApiProperty({
    enum: DateFilterSearchMode,
  })
  mode?: DateFilterSearchMode;

  @IsNumber()
  firstYear: number;

  @IsNumber()
  @ValidateIf((_, value) => !value?.mode)
  secondYear?: number;
}

export class SearchQueryDateFilterValue extends BaseSearchQueryFilterValue {
  @Equals(FilterType.DATE)
  type: 'DATE';

  @IsEnum(DateFilterSearchMode)
  @IsOptional()
  @ApiProperty({
    enum: DateFilterSearchMode,
  })
  mode?: DateFilterSearchMode;

  @IsDateString()
  firstDate: string;

  @IsDateString()
  @IsOptional()
  @ValidateIf((_, value) => !value?.mode)
  secondDate?: string;
}

export class SearchQueryTextFilterValue extends BaseSearchQueryFilterValue {
  @Equals(FilterType.TEXT)
  type: 'TEXT';

  @IsEnum(TextFilterSearchMode)
  @ApiProperty({
    enum: TextFilterSearchMode,
  })
  mode: TextFilterSearchMode;

  @IsString()
  @IsOptional()
  @ValidateIf((_, value) => value?.mode !== TextFilterSearchMode.ISNULL)
  text?: string;

  @IsBoolean()
  negate: boolean;
}

export class SearchQueryIntegerFilterValue extends BaseSearchQueryFilterValue {
  @Equals(FilterType.INTEGER)
  type: 'INTEGER';

  @IsEnum(DateFilterSearchMode)
  @IsOptional()
  @ApiProperty({
    enum: DateFilterSearchMode,
  })
  mode?: DateFilterSearchMode;

  @IsNumber()
  firstInteger: number;

  @IsNumber()
  @ValidateIf((_, value) => !value?.mode)
  secondInteger?: number;
}

export class SearchQuerySinglechoiceFilterValue extends BaseSearchQueryFilterValue {
  @Equals(FilterType.SINGLE_CHOICE)
  type: 'SINGLE_CHOICE';

  @IsString()
  choiceId: string;
}

export class SearchQueryMultichoiceFilterValue extends BaseSearchQueryFilterValue {
  @Equals(FilterType.MULTI_CHOICE)
  type: 'MULTI_CHOICE';

  @IsString({ each: true })
  choiceIds: string[];
}

export type SearchQueryFilterValueDto =
  | SearchQueryMultichoiceFilterValue
  | SearchQueryDateFilterValue
  | SearchQueryYearFilterValue
  | SearchQueryIntegerFilterValue
  | SearchQuerySinglechoiceFilterValue
  | SearchQueryTextFilterValue;

export class SearchQueryDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsNumberString()
  @IsOptional()
  offset?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @Transform(({ value }) => {
    if (value === 'undefined') return;

    return typeof value === 'string' ? JSON.parse(value) : value;
  })
  @IsArray()
  @ArrayUnique((o) => o.id)
  @ValidateNested({ each: true })
  @IsOptional()
  @ApiProperty({
    description: 'Pre-saved images (same format as in db, contain embeddings)',
  })
  savedImages?: ImageDto[];

  @ApiProperty({
    description: 'Multiple images files under the `imageFiles` fieldname',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsArray()
  @IsOptional()
  imageFiles?: File[];

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
  filterValues?: SearchQueryFilterValueDto[];
}
