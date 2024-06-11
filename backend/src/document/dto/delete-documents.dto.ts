import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class DeleteDocumentsDto {
  @ArrayMinSize(1)
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
