import { BadRequestException } from '@nestjs/common';

export class RecordNotFoundException extends BadRequestException {
  constructor(id?: number) {
    super(`the requested record ${id ? id + ' ' : ''}does not exists`);
  }
}
