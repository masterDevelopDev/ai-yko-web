import { Body, Controller, Get, Post } from '@nestjs/common';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserProfileResponseDto } from './dto/update-user-profile-response.dto';

@ApiTags('user')
@Auth(AuthType.JwtCookie)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser(@ActiveUser() user: ActiveUserData): Promise<UserProfileDto> {
    return this.userService.getUser(user.sub);
  }

  @Post()
  updateProfile(
    @ActiveUser() user: ActiveUserData,
    @Body() payload: UpdateUserProfileDto,
  ): Promise<UpdateUserProfileResponseDto> {
    return this.userService.updateProfile(user.sub, user.email, payload);
  }
}
