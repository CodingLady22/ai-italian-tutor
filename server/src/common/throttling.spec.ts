import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { AppModule } from '../app.module';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { DEFAULT_THROTTLE, LOGIN_THROTTLE, SIGNUP_THROTTLE } from './constants';

describe('rate limiting', () => {
  it('registers ThrottlerGuard globally in AppModule', () => {
    const providers: any[] = Reflect.getMetadata('providers', AppModule);
    const globalGuard = providers.find((p) => p?.provide === APP_GUARD);

    expect(globalGuard?.useClass).toBe(ThrottlerGuard);
  });

  describe('auth routes', () => {
    let app: INestApplication;
    const authService = {
      login: jest.fn().mockRejectedValue(new Error('unused')),
      signup: jest.fn(),
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      authService.login.mockResolvedValue({ access_token: 'x' });
      authService.signup.mockResolvedValue({ message: 'ok' });

      const moduleRef = await Test.createTestingModule({
        imports: [ThrottlerModule.forRoot([DEFAULT_THROTTLE])],
        controllers: [AuthController],
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: APP_GUARD, useClass: ThrottlerGuard },
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      await app.init();
    });

    afterEach(() => app.close());

    const credentials = { email: 'ada@example.com', password: 'longenough1' };

    it(`blocks login after ${LOGIN_THROTTLE.limit} attempts per minute`, async () => {
      for (let i = 0; i < LOGIN_THROTTLE.limit; i++) {
        await request(app.getHttpServer()).post('/auth/login').send(credentials).expect(200);
      }
      await request(app.getHttpServer()).post('/auth/login').send(credentials).expect(429);
    });

    it(`blocks signup after ${SIGNUP_THROTTLE.limit} attempts per minute`, async () => {
      const body = { name: 'Ada', ...credentials };
      for (let i = 0; i < SIGNUP_THROTTLE.limit; i++) {
        await request(app.getHttpServer()).post('/auth/signup').send(body).expect(201);
      }
      await request(app.getHttpServer()).post('/auth/signup').send(body).expect(429);
    });
  });
});
