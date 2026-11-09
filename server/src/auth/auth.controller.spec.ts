import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { signup: jest.fn(), login: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('signup passes the body to AuthService and returns its result', async () => {
    const body = { name: 'Ada', email: 'ada@example.com', password: 'secret123' } as never;
    authService.signup.mockResolvedValue({ access_token: 't' });

    await expect(controller.signup(body)).resolves.toEqual({ access_token: 't' });
    expect(authService.signup).toHaveBeenCalledWith(body);
  });

  it('login passes the body to AuthService and returns its result', async () => {
    const body = { email: 'ada@example.com', password: 'secret123' } as never;
    authService.login.mockResolvedValue({ access_token: 't' });

    await expect(controller.login(body)).resolves.toEqual({ access_token: 't' });
    expect(authService.login).toHaveBeenCalledWith(body);
  });
});
