import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('port');
  const host = configService.get('host');
  await app.listen(port, host, () => {
    Logger.log(`Server is running http://${host}:${port}/`);
  });
}
bootstrap();
