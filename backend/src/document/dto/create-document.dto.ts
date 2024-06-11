import { File } from '@nest-lab/fastify-multer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  NotEquals,
  ValidateNested,
} from 'class-validator';
import { DocumentFilterValueDto } from './document-filter-values.dto';
import { Transform } from 'class-transformer';

export class CreateDocumentDto {
  @IsString()
  @NotEquals('')
  categoryId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Single PDF file under the `file` fieldname',
  })
  file: File;

  @Transform(({ value }) => JSON.parse(value))
  @ValidateNested({ each: true })
  @IsOptional()
  filters: DocumentFilterValueDto[];
}
