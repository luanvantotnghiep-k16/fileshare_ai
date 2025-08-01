import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for your frontend
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  const configService = app.get(ConfigService);
  console.log('MongoDB URI:', configService.get('database.mongo_url'));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
