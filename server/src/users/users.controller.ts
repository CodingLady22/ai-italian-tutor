import { Controller, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Put('api-key')
  async updateApiKey(@Req() req: any, @Body('apiKey') apiKey: string) {
    const userId = req.user.userId;
    await this.usersService.updateApiKey(userId, apiKey);
    return { message: 'API key updated successfully' };
  }
}
