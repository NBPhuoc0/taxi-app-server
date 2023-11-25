import { INestApplication, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongodbConfig from './utils/mongodb.config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { DriversModule } from './drivers/drivers.module';
import { AzureStorageModule } from './utils/auzre/storage-blob.module';
import { SocketModule } from './socket/socket.module';
import { AdminModule } from './admin/admin.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
    EventEmitterModule.forRoot(
      {
        wildcard: true,
        delimiter: '.',
        maxListeners: 10,
        verboseMemoryLeak: true,
        ignoreErrors: false,
      }
    ),
    UsersModule,
    SocketModule,
    AuthModule,
    OrdersModule,
    DriversModule,
    AzureStorageModule,
    AdminModule
   ],
  controllers: [],
  providers: [],
})
export class AppModule {
  static port: number | string;

  constructor(private configService: ConfigService) {
    AppModule.port = configService.get('PORT') || 8080;
  }

  static getBaseUrl(app: INestApplication): string {
    let baseUrl = app.getHttpServer().address().address;
    if (baseUrl == '0.0.0.0' || baseUrl == '::') {
        return (baseUrl = 'localhost');
    }
}
}
