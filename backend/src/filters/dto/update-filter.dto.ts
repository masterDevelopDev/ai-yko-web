import { ArrayUnique, IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateFilterDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @ArrayUnique((o) => o)
  @IsString({ each: true })
  @IsArray()
  newOptions?: string[];
}
