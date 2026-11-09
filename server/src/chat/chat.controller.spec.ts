import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  const chatService = {
    startSession: jest.fn(),
    getUserSessions: jest.fn(),
    getSessionMessages: jest.fn(),
    sendMessage: jest.fn(),
    deleteSession: jest.fn(),
  };
  const req = { user: { userId: 'user-1' } };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: chatService }],
    }).compile();

    controller = module.get(ChatController);
  });

  it('uses the user id from the JWT, not from the request body', async () => {
    const dto = { message: 'Ciao', sessionId: 's1' } as never;
    chatService.sendMessage.mockResolvedValue({ ok: true });

    await controller.sendMessage(req, dto);

    expect(chatService.sendMessage).toHaveBeenCalledWith('user-1', dto);
  });

  it('lists only the logged-in user\'s sessions', async () => {
    chatService.getUserSessions.mockResolvedValue([]);

    await controller.getUserSessions(req);

    expect(chatService.getUserSessions).toHaveBeenCalledWith('user-1');
  });

  it('passes the user id and session id when reading messages', async () => {
    chatService.getSessionMessages.mockResolvedValue([]);

    await controller.getSessionMessages({ id: 's1' } as never, req);

    expect(chatService.getSessionMessages).toHaveBeenCalledWith('user-1', 's1');
  });

  it('passes the user id and session id when deleting a session', async () => {
    chatService.deleteSession.mockResolvedValue({ deleted: true });

    await controller.deleteSession({ id: 's1' } as never, req);

    expect(chatService.deleteSession).toHaveBeenCalledWith('user-1', 's1');
  });
});
