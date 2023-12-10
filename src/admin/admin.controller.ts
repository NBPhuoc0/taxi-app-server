import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuardA } from 'src/utils/guards/accessTokenA.guard';
import { UsersService } from 'src/users/users.service';
import { DriversService } from 'src/drivers/drivers.service';
import { OrdersService } from 'src/orders/orders.service';
import { FilterUserDto } from 'src/users/dto/filter-user.dto';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { TwilioService } from 'nestjs-twilio';

@Controller('admin')
@ApiBearerAuth()
@ApiTags('Administration')
@UseGuards(AccessTokenGuardA)  
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UsersService,
    private readonly driverService: DriversService,
    private readonly orderService: OrdersService,
    private readonly twilioService: TwilioService,
  ) {}


  @Post()
  create_admin(@Body() createAdminDto: any) {
    return this.adminService.create(createAdminDto);
  }

  // USER
  @ApiOkResponse({
    status: 200,
    description: 'returns User ',
  })
  @Get('users')
  getUserByID(@Query() query: {id: string}) {
    return this.userService.findById(query.id);
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns User',
  })
  @Get('users/filter')
  async getAllUsers(@Query() query: FilterUserDto) {
    return this.userService.findUsers(query);
  }

  // DRIVER
  @ApiOkResponse({
    status: 200,
    description: 'returns User',
  })
  @Get('drivers/filter')
  async getAllDrivers(@Query() query: FilterUserDto) {
    return this.driverService.findDrivers(query);
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns Driver ',
  })
  @Get('drivers')
  getDriverByID(@Query() query: {id: string}) {
    return this.driverService.findById(query.id);
  }

  // ORDER
  @ApiOkResponse({
    status: 200,
    description: 'returns list of orders ',
  })
  @Get('orders/users/filter')
  getOrdersByUser(@Query() query: {uid: string, src: string, des: string, limit: number, currPage: number}) {
    return this.orderService.findByUser(query.uid, query.src, query.des, query.limit, query.currPage);;
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns list of orders ',
  })
  @Get('orders/drivers/filter')
  getOrdersByDriver(@Query() query: {id: string, src: string, des: string, limit: number, currPage: number}) {
    return this.orderService.findByDriver(query.id, query.src, query.des, query.limit, query.currPage);;
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns list of orders ',
  })
  @Get('orders/users/statistics')
  getStatisticByUser(@Query() query) {
    return this.orderService.statisticsByUser(query.id);
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns list of orders ',
  })
  @Get('orders/drivers/statistics')
  getStatisticByDriver(@Query() query) {
    return this.orderService.statisticsByDriver(query.id);
  }

  @ApiOkResponse({
    status: 200,
    description: 'return order',
  })
  @Post('order')
  createOrder(@Body() order: CreateOrderDto,@Body('userID') userID: string) {
    return this.orderService.createByAdmin(userID, order);
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns list of orders ',
  })
  @Get('orders/filter')
  getOrders(@Query() query: { src?: string, des?: string, orderStatus: string, limit?: number, currPage?: number }) {
    return this.orderService.findOrders(query.src, query.des, query.orderStatus, query.limit, query.currPage);
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns list of orders ',
  })
  @Get('orders/details')
  getOrderDetails(@Query() query: { id: string }) {
    return this.orderService.findByid(query.id);
  }

  sendSMS(@Body() body: {phone: string, message: string}) {
    return this.twilioService.client.messages.create(
      {
        body: body.message,
        from: '+12023189346',
        to: body.phone,
        // Body: "hé looo"
        // From: "+12023189346"
        // To: "+84333495017"
      },
    );
  }
}
