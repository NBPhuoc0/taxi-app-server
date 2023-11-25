import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('orders')
@ApiBearerAuth()
@ApiTags('Orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}


}
