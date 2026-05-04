import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(
    @Body() body: RegisterDto
  ) {
    return this.authService.signup(body)
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
    login(
      @Body() body: LoginDto
    ) {
    return this.authService.login(body)
  }
}
