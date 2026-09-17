import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DEFAULT_THROTTLE } from './common/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([DEFAULT_THROTTLE]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL') || 'mongodb://localhost:27017/mydatabase',
      }),
    }),
    UsersModule, 
    AuthModule, ChatModule, AiModule
  ],
  controllers: [AppController],
  providers: [AppService, UsersService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
