import { ApiProperty } from '@nestjs/swagger';

export class UploadJunkImagesDto {
  @ApiProperty({
    description: 'Multiple images files under the `imageFiles` fieldname',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  imageFiles: File[];
}
