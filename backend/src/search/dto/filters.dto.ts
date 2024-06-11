import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { FilterKind, FilterType } from '@prisma/client';

export class FilterOrFilterGroupDto {
  @IsEnum(FilterKind)
  @ApiProperty({
    enum: FilterKind,
  })
  kind: FilterKind;

  @IsString()
  name: string;

  @IsString()
  id: string;

  @IsString()
  categoryId?: string;

  @IsEnum(FilterType)
  @IsOptional()
  @ApiProperty({
    enum: FilterType,
  })
  type?: FilterType;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  options?: string[];

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @IsOptional()
  children?: Array<FilterOrFilterGroupDto>;
}

export class FilterMappingEntry {
  @IsString()
  name: string;

  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(FilterType)
  @ApiProperty({
    enum: FilterType,
  })
  type?: FilterType;

  @IsString({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  path: string[];
}

export class FilterGroupWithMappingDto {
  @ValidateNested()
  filterGroup: FilterOrFilterGroupDto;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath(FilterMappingEntry),
    },
  })
  /** @todo implement custom validation with ValidateNested if nestjs/swagger or class-validator do not permit it */
  mapping: Record<string, FilterMappingEntry>;

  constructor(partial: Partial<FilterGroupWithMappingDto>) {
    Object.assign(this, partial);
  }
}
