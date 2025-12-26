import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto, sendMessageDto } from './dto/create-chat.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start-session')
  startSession(
    @Body() sessionDto: CreateChatDto,
    @Request() req
  ) {
    return this.chatService.startSession(req.user.userId, sessionDto)
  }

  @Get('sessions')
  getUserSessions(
    @Request() req
  ) {
    return this.chatService.getUserSessions(req.user.userId);
  }

  @Get('sessions/:id/messages')
  getSessionMessages(
    @Param('id') sessionId: string
  ) {
    return this.chatService.getSessionMessages(sessionId);
  }

  @Post('send-message')
  sendMessage(
    @Request() req, @Body() messageDto: sendMessageDto
  ) {
    return this.chatService.sendMessage(req.user.userId, messageDto);
  }
}
