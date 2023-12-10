import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './utils/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter';
import { WSExceptionFilter } from './utils/filters/ws-exception.filter';
// import { AzureSocketIO } from './chat/adapters/azure-pubsub.adapter';

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
  app.useGlobalFilters(new HttpExceptionFilter())

  const logger = new Logger('Main')

  setupSwagger(app)
  app.use(helmet())

  await app.listen(AppModule.port)

  // log docs
  const baseUrl = AppModule.getBaseUrl(app)
  const url = `http://${baseUrl}:${AppModule.port}`
  logger.log(`API Documentation available at ${url}`);
}
bootstrap();
