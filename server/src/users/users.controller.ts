import { Controller, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { AiService } from '../ai/ai.service';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly aiService: AiService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Put('api-key')
  async updateApiKey(@Req() req: any, @Body() body: UpdateApiKeyDto) {
    const userId = req.user.userId;
    await this.aiService.validateApiKey(body.apiKey);
    await this.usersService.updateApiKey(userId, body.apiKey);
    return { message: 'API key updated successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('language')
  async updateLanguage(@Req() req: any, @Body() body: UpdateLanguageDto) {
    const userId = req.user.userId;
    await this.usersService.updateSupportLanguage(userId, body.supportLanguage);
    return { message: 'Support language updated successfully' };
  }
}
