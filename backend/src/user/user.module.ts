import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [IamModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
