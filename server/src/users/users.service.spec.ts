import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { User } from '../auth/schema/user.schema';

const ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: {
    findOne: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };

  const execResult = (value: unknown) => ({ exec: jest.fn().mockResolvedValue(value) });

  beforeEach(async () => {
    userModel = {
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn().mockReturnValue(ENCRYPTION_KEY) } },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('finds a user by email', async () => {
    const user = { email: 'a@b.com' };
    userModel.findOne.mockReturnValue(execResult(user));

    await expect(service.findOneByEmail('a@b.com')).resolves.toBe(user);
    expect(userModel.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
  });

  it('increments the free-call counter by one', async () => {
    userModel.findByIdAndUpdate.mockReturnValue(execResult({ fallbackCount: 3 }));

    await service.incrementFallbackCount('user-1');

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      { $inc: { fallbackCount: 1 } },
      { new: true },
    );
  });

  it('stores the API key encrypted, never in plain text', async () => {
    userModel.findByIdAndUpdate.mockReturnValue(execResult({}));

    await service.updateApiKey('user-1', 'my-secret-key');

    const update = userModel.findByIdAndUpdate.mock.calls[0][1];
    expect(update.geminiApiKey).toBeDefined();
    expect(update.geminiApiKey).not.toContain('my-secret-key');
  });

  it('decrypts a stored API key back to the original value', async () => {
    userModel.findByIdAndUpdate.mockReturnValue(execResult({}));
    await service.updateApiKey('user-1', 'my-secret-key');
    const encrypted = userModel.findByIdAndUpdate.mock.calls[0][1].geminiApiKey;

    expect(service.decryptApiKey(encrypted)).toBe('my-secret-key');
  });
});
