import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class IndexationStatusDto {
  @IsEnum(DocumentStatus)
  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;
}
