import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.DB_URL || 'mongodb://localhost:27017/mydatabase'
    ),
    UsersModule, 
    AuthModule, ChatModule, AiModule, MailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
