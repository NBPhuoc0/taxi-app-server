import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, WsResponse, } from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ApiTags } from '@nestjs/swagger';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { ChatMessageDto } from './dto/chats-massage.dto';

@ApiTags('chat')
@WebSocketGateway({ 
  namespace: 'chat',
  cors: {origin: '*',},
})
export class ChatsGateway implements NestGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('MessageGateway');
  constructor(private readonly chatService: ChatsService) {}


  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  
  @SubscribeMessage('send-message')
  sendMessage(@MessageBody() data: ChatMessageDto)  {
    this.chatService.createMessage(data);
    const chatId = data.chatId;
    this.server.emit(chatId,data.message);
    return data;
  }

}
