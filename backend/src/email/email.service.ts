import { Injectable } from '@nestjs/common';

export type EmailData = {
  subject: string;
  text: string;
  html: string;
  to: string;
};

@Injectable()
export abstract class EmailService {
  abstract sendEmail(data: EmailData): Promise<void>;
}
