import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService.signup', () => {
  let service: AuthService;
  const usersService = {
    findOneByEmail: jest.fn(),
    createUser: jest.fn(),
  };
  const dto = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'longenough1' };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('creates the user and never returns the password hash', async () => {
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.createUser.mockResolvedValue({
      _id: 'u1',
      email: dto.email,
      name: dto.name,
      password: 'hash',
      italian_level: 'A1',
      supportLanguage: 'English',
    });

    const result = await service.signup(dto);

    expect(result.user).not.toHaveProperty('password');
    expect(usersService.createUser.mock.calls[0][0].password).not.toBe(dto.password);
  });

  it('returns 409 when the email already exists', async () => {
    usersService.findOneByEmail.mockResolvedValue({ _id: 'u1' });

    await expect(service.signup(dto)).rejects.toThrow(ConflictException);
    expect(usersService.createUser).not.toHaveBeenCalled();
  });

  it('returns 409, not 500, when two signups race and Mongo reports a duplicate key', async () => {
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.createUser.mockRejectedValue({ code: 11000 });

    await expect(service.signup(dto)).rejects.toThrow(ConflictException);
  });

  it('rethrows other database errors', async () => {
    usersService.findOneByEmail.mockResolvedValue(null);
    usersService.createUser.mockRejectedValue(new Error('connection lost'));

    await expect(service.signup(dto)).rejects.toThrow('connection lost');
  });
});
