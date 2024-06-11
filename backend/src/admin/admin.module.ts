import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { IamModule } from '../iam/iam.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [IamModule],
})
export class AdminModule {}
