import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  app.enableCors({
    origin: [frontendUrl, 
      'http://localhost:5173',
      /https:\/\/ai-italian-tutor.*\.vercel\.app$/ // matches any vercel deployment
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
