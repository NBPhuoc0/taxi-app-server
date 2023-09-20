import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './utils/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';



async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: '*',
    credentials: true
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  )
  app.use(cookieParser())
  const logger = new Logger('Main')

  setupSwagger(app)
  app.use(helmet())

  await app.listen(3000);
  logger.log(`API Documentation available at localhost:3000`);
}
bootstrap();
