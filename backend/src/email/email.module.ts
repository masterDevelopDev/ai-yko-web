import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NodeMailerService } from './nodemailer-smtp.service';

@Module({
  providers: [
    {
      provide: EmailService,
      useClass: NodeMailerService,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
