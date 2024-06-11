import { IsString } from 'class-validator';

export class CreateDocumentResponseDto {
  @IsString()
  documentId: string;
}
