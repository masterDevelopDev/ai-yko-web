import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { FilterType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsString } from 'class-validator';

class BaseDocumentFilterValue {}

export class DocumentDateFilterValue extends BaseDocumentFilterValue {
  @IsDateString()
  date: string;
}

export class DocumentYearFilterValue extends BaseDocumentFilterValue {
  @IsNumber()
  year: number;
}

export class DocumentIntegerFilterValue extends BaseDocumentFilterValue {
  @IsNumber()
  integer: number;
}

export class DocumentTextFilterValue extends BaseDocumentFilterValue {
  @IsString()
  text: string;
}

export class DocumentSinglechoiceFilterValue extends BaseDocumentFilterValue {
  @IsString()
  choiceId: string;
}

export class DocumentMultichoiceFilterValue extends BaseDocumentFilterValue {
  @IsString({ each: true })
  choiceIds: string[];
}

export class DocumentFilterValueDto {
  @IsString()
  filterId: string;

  @IsString()
  @IsEnum(FilterType)
  @ApiProperty({ enum: FilterType })
  type: FilterType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(DocumentDateFilterValue) },
      { $ref: getSchemaPath(DocumentYearFilterValue) },
      { $ref: getSchemaPath(DocumentIntegerFilterValue) },
      { $ref: getSchemaPath(DocumentTextFilterValue) },
      { $ref: getSchemaPath(DocumentMultichoiceFilterValue) },
      {
        $ref: getSchemaPath(DocumentSinglechoiceFilterValue),
      },
    ],
  })
  @Type(() => BaseDocumentFilterValue, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        { value: DocumentTextFilterValue, name: FilterType.TEXT },
        { value: DocumentIntegerFilterValue, name: FilterType.INTEGER },
        { value: DocumentYearFilterValue, name: FilterType.YEAR },
        { value: DocumentDateFilterValue, name: FilterType.DATE },
        {
          value: DocumentMultichoiceFilterValue,
          name: FilterType.MULTI_CHOICE,
        },
        {
          value: DocumentSinglechoiceFilterValue,
          name: FilterType.SINGLE_CHOICE,
        },
      ],
    },
  })
  value:
    | DocumentMultichoiceFilterValue
    | DocumentDateFilterValue
    | DocumentYearFilterValue
    | DocumentIntegerFilterValue
    | DocumentSinglechoiceFilterValue
    | DocumentTextFilterValue;
}
