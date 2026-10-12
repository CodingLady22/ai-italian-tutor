import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatSession } from './schema/chat-session.schema';
import { ChatMessage } from './schema/chat-message.schema';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';

describe('ChatService', () => {
  let service: ChatService;
  const sessionModel = { findOne: jest.fn() };
  const messageModel = {
    find: jest.fn(),
    deleteMany: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken(ChatSession.name), useValue: sessionModel },
        { provide: getModelToken(ChatMessage.name), useValue: messageModel },
        { provide: AiService, useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    service = module.get(ChatService);
  });

  describe('getSessionMessages', () => {
    it('looks the session up by id AND owner', async () => {
      sessionModel.findOne.mockResolvedValue({ _id: 'session1' });
      const exec = jest.fn().mockResolvedValue([{ content: 'ciao' }]);
      messageModel.find.mockReturnValue({ sort: () => ({ exec }) });

      const result = await service.getSessionMessages('user1', 'session1');

      expect(sessionModel.findOne).toHaveBeenCalledWith({ _id: 'session1', user_id: 'user1' });
      expect(result).toEqual([{ content: 'ciao' }]);
    });

    it("refuses to return another user's messages", async () => {
      sessionModel.findOne.mockResolvedValue(null);

      await expect(service.getSessionMessages('intruder', 'session1')).rejects.toThrow(NotFoundException);
      expect(messageModel.find).not.toHaveBeenCalled();
    });
  });

  describe('deleteSession', () => {
    it("refuses to delete another user's session", async () => {
      sessionModel.findOne.mockResolvedValue(null);

      await expect(service.deleteSession('intruder', 'session1')).rejects.toThrow(NotFoundException);
      expect(messageModel.deleteMany).not.toHaveBeenCalled();
    });
  });
});
