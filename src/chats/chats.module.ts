import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsSchema } from './schema/chats.schema';
import { MessageSchema } from './schema/message.schema';
import { ChatsController } from './chats.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chats', schema: ChatsSchema },
      { name: 'Message', schema: MessageSchema}
    ]),
  ],
  controllers: [ChatsController],
  providers: [ChatsGateway, ChatsService],
  exports: [ChatsService]
})
export class ChatsModule {}
