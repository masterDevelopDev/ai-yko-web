import { BadRequestException } from '@nestjs/common';

export class FilterNotFoundException extends BadRequestException {
  constructor(filterId?: string) {
    super(
      `one of the requested filters ${
        filterId ? filterId + ' ' : ''
      }does not exists`,
    );
  }
}
