import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SIGNUP_THROTTLE, LOGIN_THROTTLE } from '../common/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: SIGNUP_THROTTLE })
  @Post('signup')
  signup(
    @Body() body: RegisterDto
  ) {
    return this.authService.signup(body)
  }

  @Throttle({ default: LOGIN_THROTTLE })
  @HttpCode(HttpStatus.OK)
  @Post('login')
    login(
      @Body() body: LoginDto
    ) {
    return this.authService.login(body)
  }
}
