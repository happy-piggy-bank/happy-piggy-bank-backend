import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:4000', 'https://happypiggybank.click', 'https://www.happypiggybank.click'],
      credentials: true
    }
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )
  await app.listen(3000);
}
bootstrap();
