import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { FilterType, MonitoringFrequency } from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ImageDto } from './search-result.dto';
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
import { Transform, Type } from 'class-transformer';

export class SavedSearchDto {
  @IsInt()
  id: number;

  @IsBoolean()
  isMonitored: boolean;

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

  @IsString()
  categoryId: string;

  @IsString()
  name: string;

  @IsEnum(MonitoringFrequency)
  @ApiProperty({
    enum: MonitoringFrequency,
  })
  monitoringFrequency: MonitoringFrequency;

  @IsString()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  images: ImageDto[];
}
