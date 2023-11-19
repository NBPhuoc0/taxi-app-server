import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, WsResponse, } from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ApiTags } from '@nestjs/swagger';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { ChatMessageDto } from './dto/chats-massage.dto';
import { UsersService } from '../users/users.service';
import { DriversService } from '../drivers/drivers.service';
import { LocationUpdateDto } from './dto/location-update.dto';

@ApiTags('socket')
@WebSocketGateway({ 
  namespace: 'socket',
  cors: {origin: '*',},
})
export class SocketGateway implements NestGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketGateway');
  constructor(
    private readonly chatService: ChatsService,
    private readonly userService: UsersService,
    private readonly driverService: DriversService
  ) {}


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
  
  @SubscribeMessage('update-location-driver')
  updateLocation(@MessageBody() data: LocationUpdateDto)  {
    this.driverService.updateLocation(data.id, data.location);
    return data;
  }
  
  @SubscribeMessage('update-location-user')
  updateLocationUser(@MessageBody() data: LocationUpdateDto)  {
    this.userService.updateLocation(data.id, data.location);
    return data;
  }

}
