import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';

describe('UsersController.updateApiKey', () => {
  const usersService = { updateApiKey: jest.fn() };
  const aiService = { validateApiKey: jest.fn() };
  const controller = new UsersController(usersService as any, aiService as any);
  const req = { user: { userId: 'user1' } };

  beforeEach(() => jest.resetAllMocks());

  it('saves the key once Gemini accepts it', async () => {
    aiService.validateApiKey.mockResolvedValue(undefined);

    await controller.updateApiKey(req, { apiKey: 'good-key-1234567890' });

    expect(usersService.updateApiKey).toHaveBeenCalledWith('user1', 'good-key-1234567890');
  });

  it('does not save a key Gemini rejects', async () => {
    aiService.validateApiKey.mockRejectedValue(new BadRequestException());

    await expect(controller.updateApiKey(req, { apiKey: 'bad-key-1234567890' })).rejects.toThrow(BadRequestException);

    expect(usersService.updateApiKey).not.toHaveBeenCalled();
  });
});
