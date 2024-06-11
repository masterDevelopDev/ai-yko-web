import { IsOptional, IsString } from 'class-validator';

export class FindAllFiltersQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  groupsOnly?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
