import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatSession, ChatSessionSchema } from './schema/chat-session.schema';
import { ChatMessage, ChatMessageSchema } from './schema/chat-message.schema';
import { AiModule } from '../ai/ai.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    AiModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
