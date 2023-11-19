import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatDto } from './dto/create-chats.dto';
import { Chats, ChatsDocument } from './schema/chats.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessageDto } from './dto/chats-massage.dto';
import { Message, MessageDocument } from './schema/message.schema';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chats.name)
    private chatModel: Model<ChatsDocument>,

    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async create(ChatDto: ChatDto): Promise<ChatsDocument> {
    const createdChat = new this.chatModel(ChatDto);
    return createdChat.save();
  }

  async createMessage(messageDto: ChatMessageDto): Promise<MessageDocument> {
    const createdMessage = new this.messageModel(messageDto);
    return createdMessage.save();
  }


  async findOneChats(id: string): Promise<ChatsDocument> {
    const chats = await this.chatModel.findById(id).exec();

    if (!chats) { throw new HttpException( 'Chat not found', HttpStatus.NOT_FOUND)}

    return chats;
  }


  async deleteChats(id: string): Promise<ChatsDocument> {

    await this.messageModel.deleteMany(
      {
        chatId: id
      }
    )

    return await this.chatModel.findByIdAndDelete(id).exec();
  }


}
