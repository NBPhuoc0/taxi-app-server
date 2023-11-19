import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { SocketGateway } from './socket.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsSchema } from './schema/chats.schema';
import { MessageSchema } from './schema/message.schema';
import { ChatsController } from './chats.controller';
import { UsersModule } from '../users/users.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chats', schema: ChatsSchema },
      { name: 'Message', schema: MessageSchema}
    ]),
    UsersModule,
    DriversModule
  ],
  controllers: [ChatsController],
  providers: [SocketGateway, ChatsService],
  exports: [ChatsService]
})
export class SocketModule {}
