import { ArrayMinSize, IsArray, IsString } from 'class-validator';

// TODO: ajouter une validation pipe qui permet de verifier que l utilisateur a bien acces aux documents
export class DocumentExportRequestDto {
  @ArrayMinSize(1)
  @IsArray()
  @IsString({ each: true })
  documentIds: string[];
}
