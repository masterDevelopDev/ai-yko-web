import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EmailData, EmailService } from './email.service';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodeMailerService implements EmailService, OnModuleInit {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  private logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: 587,
      requireTLS: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendEmail(data: EmailData): Promise<void> {
    this.transporter.sendMail(
      {
        ...data,
        subject: data.subject + '- mailbox01',
        text: 'mailbox01 + \n\n' + data.text,
        from: this.configService.get('SMTP_FROM_EMAIL'),
      },
      (err, info) => {
        if (err) {
          this.logger.log('mail error', err);
        } else {
          this.logger.log('mail success', info.response);
        }
      },
    );
  }
}
