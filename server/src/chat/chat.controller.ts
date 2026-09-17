import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { CreateChatDto, sendMessageDto, SessionIdParamDto } from './dto/create-chat.dto';
import { START_SESSION_THROTTLE, SEND_MESSAGE_THROTTLE } from '../common/constants';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Throttle({ default: START_SESSION_THROTTLE })
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
    @Param() params: SessionIdParamDto,
    @Request() req
  ) {
    return this.chatService.getSessionMessages(req.user.userId, params.id);
  }

  @Throttle({ default: SEND_MESSAGE_THROTTLE })
  @Post('send-message')
  sendMessage(
    @Request() req, @Body() messageDto: sendMessageDto
  ) {
    return this.chatService.sendMessage(req.user.userId, messageDto);
  }

  @Delete('sessions/:id')
  deleteSession(
    @Param() params: SessionIdParamDto,
    @Request() req
  ) {
    return this.chatService.deleteSession(req.user.userId, params.id);
  }
}
