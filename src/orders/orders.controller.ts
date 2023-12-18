import { Controller, Get, Post, Body, Patch, Param, Delete, Sse, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Observable, from, fromEvent, map } from 'rxjs';

@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {

  }
  logger = new Logger('OrdersController');

  @Sse('sse')
  async sse():Promise<Observable<MessageEvent<string>>> {
    this.logger.log('sse connected');
    const eventEmitter = await this.ordersService.getObservable(); 
    return fromEvent(eventEmitter, 'trigger').pipe(
      map((data : any ) => {
        this.logger.log('sse trigger!!!!');
        return new MessageEvent('ố dè', { data } );
      }),
    );
  }
}
