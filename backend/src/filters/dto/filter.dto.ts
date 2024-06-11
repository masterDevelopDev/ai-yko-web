import { ApiProperty } from '@nestjs/swagger';
import { FilterKind, FilterType } from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class FilterDto {
  @IsString()
  name: string;

  @IsString()
  id: string;

  @ApiProperty({
    enum: FilterKind,
  })
  @IsEnum(FilterKind)
  kind: FilterKind;

  @ApiProperty({
    enum: FilterType,
  })
  @IsOptional()
  @IsEnum(FilterType)
  type?: FilterType;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString({ each: true })
  @ArrayUnique((o) => o)
  @IsArray()
  options?: string[];
}
