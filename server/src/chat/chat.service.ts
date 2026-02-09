import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatSession, ChatSessionDocument } from './schema/chat-session.schema';
import { ChatMessage, ChatMessageDocument } from './schema/chat-message.schema';
import { AiService } from '../ai/ai.service';
import { CreateChatDto, sendMessageDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {

  constructor(
    @InjectModel(ChatSession.name) private sessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name) private messageModel: Model<ChatMessageDocument>,
    private aiService: AiService,
  ) {}

  async startSession(userId: string, dto: CreateChatDto) {
    const session = new this.sessionModel({
      user_id: userId,
      ...dto
    })
    return session.save();
  }

  async getUserSessions(userId: string) {
    return this.sessionModel.find({ user_id: userId}).sort({ createdAt: -1 }).exec();
  }

  async getSessionMessages(sessionId: string) {
    // return this.sessionModel.find({ session_id: sessionId }).sort({ createdAt: 1 }).exec();
    return this.messageModel.find({ session_id: sessionId }).sort({ createdAt: 1 }).exec();
  }

  async sendMessage(userId: string, dto: sendMessageDto) {
    const session = await this.sessionModel.findOne({ _id: dto.sessionId, user_id: userId})
    if(!session) throw new NotFoundException('Chat session not found');

    const userMsg = new this.messageModel({
      session_id: dto.sessionId,
      sender: 'user',
      content: dto.message,
    });
    await userMsg.save();

    const historyStored = await this.messageModel
      .find({ session_id: dto.sessionId })
      .sort({ createdAt: 1 })
      .limit(20) 
      .exec();

    const history = historyStored.slice(0, -1).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const aiResponseText = await this.aiService.generateResponse(
      history,
      dto.message,
      { level: session.level, focus_area: session.focus_area}
    )

    const aiMsg = new this.messageModel({
      session_id: dto.sessionId,
      sender: 'ai',
      content: aiResponseText
    });

    await aiMsg.save()

    return aiMsg
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.sessionModel.findOne({ 
    _id: sessionId, 
    user_id: userId 
  });
  
  if (!session) throw new NotFoundException('Session not found');
  
  await this.messageModel.deleteMany({ session_id: sessionId });
  
  await this.sessionModel.deleteOne({ _id: sessionId });
  
  return { success: true };
  }
}
