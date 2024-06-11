import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DocumentFilterValueDto } from './document-filter-values.dto';
import { Transform } from 'class-transformer';

export class UpdateDocumentDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  filters: DocumentFilterValueDto[];

  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @IsBoolean()
  deletePreviousFilters: boolean;
}
