import { ApiProperty } from '@nestjs/swagger';
import { FilterKind, FilterType } from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFilterDto {
  @IsString()
  name: string;

  @IsEnum(FilterKind)
  @ApiProperty({
    enum: FilterKind,
  })
  kind: FilterKind;

  @IsOptional()
  @ApiProperty({
    enum: FilterType,
  })
  @IsEnum(FilterType)
  type?: FilterType;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @ArrayUnique((o) => o)
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}
