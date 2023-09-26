import { INestApplication, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongodbConfig from './utils/mongodb.config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';

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
    ChatModule,
    AuthModule, ],
  controllers: [],
  providers: [],
})
export class AppModule {
  static port: number | string;

  constructor(private configService: ConfigService) {
    AppModule.port = process.env.PORT || 8080;
  }

  static getBaseUrl(app: INestApplication): string {
    let baseUrl = app.getHttpServer().address().address;
    if (baseUrl == '0.0.0.0' || baseUrl == '::') {
        return (baseUrl = 'localhost');
    }
}
}
