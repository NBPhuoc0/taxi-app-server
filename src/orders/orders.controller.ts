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

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  } 

  @Get(':id')
  findByid(@Param('id') id: string) {
    return this.ordersService.findByid(id);
  }

  @Get('user/:id')
  findByUser(@Param('id') id: string) {
    return this.ordersService.findByUser(id);
  }

  @Get('driver/:id')
  findByDriver(@Param('id') id: string) {
    return this.ordersService.findByDriver(id);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
