import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatSession, ChatSessionDocument } from './schema/chat-session.schema';
import { ChatMessage, ChatMessageDocument } from './schema/chat-message.schema';
import { AiService } from '../ai/ai.service';
import { CreateChatDto, sendMessageDto } from './dto/create-chat.dto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../auth/schema/user.schema';
import { FREE_CALL_LIMIT, AI_HISTORY_LIMIT } from '../common/constants';

@Injectable()
export class ChatService {

  constructor(
    @InjectModel(ChatSession.name) private sessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name) private messageModel: Model<ChatMessageDocument>,
    private authAiService: AiService,
    private usersService: UsersService,
  ) {}

  private assertWithinFreeLimit(user: UserDocument | null) {
    if (!user?.geminiApiKey && (user?.fallbackCount ?? 0) >= FREE_CALL_LIMIT) {
      throw new ForbiddenException('You have reached the limit of free messages. Please add your own Gemini API key in settings to continue.');
    }
  }

  /** Counts one free call, but only when the app key (not the user's own key) was used. */
  private async countFreeCall(user: UserDocument | null, userId: string): Promise<number> {
    const current = user?.fallbackCount ?? 0;
    if (user?.geminiApiKey) return current;
    const updatedUser = await this.usersService.incrementFallbackCount(userId);
    return updatedUser?.fallbackCount ?? current + 1;
  }

  async startSession(userId: string, dto: CreateChatDto) {
    const user = await this.usersService.findOneById(userId);
    this.assertWithinFreeLimit(user);

    // Ask Gemini first: if it fails nothing is saved and nothing is counted
    const initialMessage = await this.authAiService.generateResponse(
      [],
      `Inizia la conversazione come tutor amichevole. Il livello è ${dto.level}, ${dto.mode === 'grammar' ? 'insegneremo' : 'parleremo di'}: ${dto.focus_area}. Saluta e fai una domanda per iniziare.`,
      { level: dto.level, focus_area: dto.focus_area, support_language: user?.supportLanguage || 'English' },
      user?.geminiApiKey ? this.usersService.decryptApiKey(user.geminiApiKey) : undefined
    );

    const savedSession = await new this.sessionModel({
      user_id: userId,
      ...dto
    }).save();

    const firstMsg = new this.messageModel({
      session_id: savedSession._id,
      sender: 'ai',
      content: initialMessage,
    });
    await firstMsg.save();

    const fallbackCount = await this.countFreeCall(user, userId);

    return {
      session: savedSession,
      firstMessage: firstMsg,
      fallbackCount
    };
  }

  async getUserSessions(userId: string) {
    return this.sessionModel.find({ user_id: userId}).sort({ createdAt: -1 }).exec();
  }

  async getSessionMessages(userId: string, sessionId: string) {
    const session = await this.sessionModel.findOne({ _id: sessionId, user_id: userId });
    if (!session) throw new NotFoundException('Chat session not found');

    return this.messageModel.find({ session_id: sessionId }).sort({ createdAt: 1 }).exec();
  }

  async sendMessage(userId: string, dto: sendMessageDto) {
    const session = await this.sessionModel.findOne({ _id: dto.sessionId, user_id: userId})
    if(!session) throw new NotFoundException('Chat session not found');

    const user = await this.usersService.findOneById(userId);
    this.assertWithinFreeLimit(user);

    // Latest messages, oldest first. The new message is not saved yet, so it is not in here.
    const latestFirst = await this.messageModel
      .find({ session_id: dto.sessionId })
      .sort({ createdAt: -1 })
      .limit(AI_HISTORY_LIMIT)
      .exec();

    const history = latestFirst.reverse().map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // If Gemini fails this throws before anything is saved or counted
    const aiResponseText = await this.authAiService.generateResponse(
      history,
      dto.message,
      { level: session.level, focus_area: session.focus_area, support_language: user?.supportLanguage || 'English' },
      user?.geminiApiKey ? this.usersService.decryptApiKey(user.geminiApiKey) : undefined
    );

    await new this.messageModel({
      session_id: dto.sessionId,
      sender: 'user',
      content: dto.message,
    }).save();

    const aiMsg = new this.messageModel({
      session_id: dto.sessionId,
      sender: 'ai',
      content: aiResponseText
    });
    await aiMsg.save();

    const fallbackCount = await this.countFreeCall(user, userId);

    return {
      ...aiMsg.toObject(),
      fallbackCount
    };
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
