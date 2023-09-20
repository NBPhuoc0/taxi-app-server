import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongodbConfig from './utils/mongodb.config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongodbConfig]
    }), 
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (mongodbConfig: ConfigService) => ({
        uri: mongodbConfig.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ChatModule, ],
  controllers: [],
  providers: [],
})
export class AppModule {}
