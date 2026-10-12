import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadGatewayException, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatSession } from './schema/chat-session.schema';
import { ChatMessage } from './schema/chat-message.schema';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { FREE_CALL_LIMIT } from '../common/constants';

describe('ChatService AI reliability', () => {
  let service: ChatService;
  let savedMessages: any[];
  let findQuery: { sort: jest.Mock; limit: jest.Mock; exec: jest.Mock };

  const sessionModel: any = jest.fn();
  const messageModel: any = jest.fn();
  const ai = { generateResponse: jest.fn() };
  const users = {
    findOneById: jest.fn(),
    incrementFallbackCount: jest.fn(),
    decryptApiKey: jest.fn(),
  };

  const dto = { sessionId: 'session1', message: 'Io sono andato' };

  beforeEach(async () => {
    jest.resetAllMocks();
    savedMessages = [];

    messageModel.mockImplementation((doc: any) => ({
      ...doc,
      save: jest.fn().mockImplementation(async () => {
        savedMessages.push(doc);
      }),
      toObject: () => doc,
    }));
    sessionModel.mockImplementation((doc: any) => ({
      ...doc,
      _id: 'newSession',
      save: jest.fn().mockResolvedValue({ ...doc, _id: 'newSession' }),
    }));
    sessionModel.findOne = jest.fn().mockResolvedValue({ level: 'A2', focus_area: 'Passato Prossimo' });

    findQuery = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    messageModel.find = jest.fn().mockReturnValue(findQuery);

    users.findOneById.mockResolvedValue({ fallbackCount: 0, supportLanguage: 'English' });
    users.incrementFallbackCount.mockResolvedValue({ fallbackCount: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken(ChatSession.name), useValue: sessionModel },
        { provide: getModelToken(ChatMessage.name), useValue: messageModel },
        { provide: AiService, useValue: ai },
        { provide: UsersService, useValue: users },
      ],
    }).compile();

    service = module.get(ChatService);
  });

  describe('sendMessage', () => {
    it('does not save or count anything when Gemini fails', async () => {
      ai.generateResponse.mockRejectedValue(new BadGatewayException());

      await expect(service.sendMessage('user1', dto)).rejects.toThrow(BadGatewayException);

      expect(savedMessages).toHaveLength(0);
      expect(users.incrementFallbackCount).not.toHaveBeenCalled();
    });

    it('saves both messages and counts one call on success', async () => {
      ai.generateResponse.mockResolvedValue('Ottimo! Si dice "sono andato".');

      const result = await service.sendMessage('user1', dto);

      expect(savedMessages.map((m) => m.sender)).toEqual(['user', 'ai']);
      expect(users.incrementFallbackCount).toHaveBeenCalledWith('user1');
      expect(result.fallbackCount).toBe(1);
    });

    it('does not count calls made with the learner\'s own key', async () => {
      users.findOneById.mockResolvedValue({ fallbackCount: 3, geminiApiKey: 'encrypted' });
      users.decryptApiKey.mockReturnValue('plain-key');
      ai.generateResponse.mockResolvedValue('Va bene.');

      const result = await service.sendMessage('user1', dto);

      expect(users.incrementFallbackCount).not.toHaveBeenCalled();
      expect(result.fallbackCount).toBe(3);
      expect(ai.generateResponse).toHaveBeenCalledWith(expect.anything(), dto.message, expect.anything(), 'plain-key');
    });

    it('blocks users who used all free calls and have no key, without calling Gemini', async () => {
      users.findOneById.mockResolvedValue({ fallbackCount: FREE_CALL_LIMIT });

      await expect(service.sendMessage('user1', dto)).rejects.toThrow(ForbiddenException);

      expect(ai.generateResponse).not.toHaveBeenCalled();
    });

    it('sends the latest 20 messages as history, oldest first', async () => {
      // the query is sorted newest first, so the mock returns them that way
      findQuery.exec.mockResolvedValue([
        { sender: 'ai', content: 'newest' },
        { sender: 'user', content: 'middle' },
        { sender: 'ai', content: 'oldest' },
      ]);
      ai.generateResponse.mockResolvedValue('ok');

      await service.sendMessage('user1', dto);

      expect(findQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(findQuery.limit).toHaveBeenCalledWith(20);
      expect(ai.generateResponse.mock.calls[0][0]).toEqual([
        { role: 'model', parts: [{ text: 'oldest' }] },
        { role: 'user', parts: [{ text: 'middle' }] },
        { role: 'model', parts: [{ text: 'newest' }] },
      ]);
    });
  });

  describe('startSession', () => {
    const startDto = { level: 'A2', mode: 'grammar', focus_area: 'Passato Prossimo' };

    it('creates no session and counts nothing when Gemini fails', async () => {
      ai.generateResponse.mockRejectedValue(new BadGatewayException());

      await expect(service.startSession('user1', startDto)).rejects.toThrow(BadGatewayException);

      expect(sessionModel).not.toHaveBeenCalled();
      expect(savedMessages).toHaveLength(0);
      expect(users.incrementFallbackCount).not.toHaveBeenCalled();
    });

    it('counts the opener as one free call', async () => {
      ai.generateResponse.mockResolvedValue('Ciao!');

      const result = await service.startSession('user1', startDto);

      expect(users.incrementFallbackCount).toHaveBeenCalledTimes(1);
      expect(result.fallbackCount).toBe(1);
    });
  });
});
