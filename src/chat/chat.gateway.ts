import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, WsResponse, } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { ApiTags } from '@nestjs/swagger';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { Observable, Subscription } from 'rxjs';

@ApiTags('chat')
@WebSocketGateway({ 
  namespace: 'chat',
  cors: {origin: '*',},
})
export class ChatGateway implements NestGateway {
  @WebSocketServer()
  server: Server;

  private eventSubscription: Subscription;

  private logger: Logger = new Logger('MessageGateway');
  constructor(private readonly chatService: ChatService) {}


  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  @SubscribeMessage('createChat')
  create(@MessageBody() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  
  @SubscribeMessage('findAllChat')
  findAll(@MessageBody() data: string)  {
    this.server.emit('rev',data);
    return data;
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto.id, updateChatDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatService.remove(id);
  }
}
