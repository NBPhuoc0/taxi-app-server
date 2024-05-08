import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, Put, Logger } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuardA } from 'src/utils/guards/accessTokenA.guard';
import { UsersService } from 'src/users/users.service';
import { DriversService } from 'src/drivers/drivers.service';
import { OrdersService } from 'src/orders/orders.service';
import { FilterUserDto } from 'src/users/dto/filter-user.dto';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { TwilioService } from 'nestjs-twilio';
import { CreateOrderByAdminDto } from 'src/orders/dto/create-order-admin.dto';
import { log } from 'console';

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
    // private readonly twilioService: TwilioService,
  ) {}

  logger = new Logger()
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

  @ApiOkResponse({
    status: 200,
    description: 'returns Driver ',
  })
  @Patch('driver/verify')
  async verifyDriverAccount(@Body('id') id: string, @Body('status') status: boolean) {
    const updateDriver = await this.driverService.verify(id, status);
    if(!updateDriver){
      return {
        error: true,
        msg: 'Failed to update verification status'
      }
    }
    else return updateDriver;
  }

  // ORDER
  
  @ApiOkResponse({
    status: 200,
    description: 'returns list of drivers',
  })
  @Get('orders/top-drivers')
  async getTopDrivers() {
    return this.orderService.findTopDrivers();
  }

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
  @Post('orders')
  createOrder(@Body() order: CreateOrderByAdminDto) {
    return this.orderService.createByAdmin(order);
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

  @ApiOkResponse({
    status: 200,
    description: 'returns statistics',
  })
  @Get('orders/statistics')
  async getStatisticsByAdmin() {
    const statisticsOrders = await this.orderService.statisticsByAdmin();
    return statisticsOrders;
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns list of order locations',
  })
  @Get('orders/in-progress')
  async getOrderInProgress() {
    return this.orderService.findOrderInProgress();
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns list of order locations',
  })
  @Get('orders/by-time')
  async getOrdersByTime(@Query() query: { year?: string, month?: string }) {
    return this.orderService.ordersByTime(query.year, query.month);
  }

  @ApiOkResponse({
    status: 200,
    description: '',
  })
  @Delete('orders/delete')
  async deletaOrder(@Query() query: { id: string }) {
    return this.orderService.cancelOrderByAdmin(query.id);
  }

  @ApiOkResponse({
    status: 200,
    description: '',
  })
  @Post('orders/delete')
  async deletaListOrder(@Body() body: {id: string[]}) {
    return this.orderService.cancelListOrderByAdmin(body.id);
  }

  // //
  // @Post('sms')
  // sendSMS(@Body() body: {phone: string, message: string}) {
  //   try {
  //     return this.twilioService.client.messages.create(
  //       {
  //         body: body.message,
  //         from: '+12058436918',
  //         to: body.phone,
  //         // Body: "hé looo"
  //         // From: "+12023189346"
  //         // To: "+84333495017"
  //       },
  //     );
  //   } catch (error) {
  //     return error;
  //   }
  // }
}
