import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { NodeMailerService } from './nodemailer-smtp.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EmailService,
          useClass: NodeMailerService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
