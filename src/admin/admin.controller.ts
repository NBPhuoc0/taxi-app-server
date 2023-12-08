import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuardA } from 'src/utils/guards/accessTokenA.guard';
import { UsersService } from 'src/users/users.service';
import { DriversService } from 'src/drivers/drivers.service';
import { OrdersService } from 'src/orders/orders.service';
import { FilterUserDto } from 'src/users/dto/filter-user.dto';

@Controller('admin')
@ApiBearerAuth()
@ApiTags('Administration')
// @UseGuards(AccessTokenGuardA)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UsersService,
    private readonly driverService: DriversService,
    private readonly orderService: OrdersService,
  ) {}


  @Post()
  create_admin(@Body() createAdminDto: any) {
    return this.adminService.create(createAdminDto);
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns User',
  })
  @Get('users/filter')
  async getAllUsers(@Query() query: FilterUserDto) {
    return this.userService.findUsers(query);
  }

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
    description: 'returns User ',
  })
  @Get('users')
  getUserByID(@Query() query: {id: string}) {
    return this.userService.findById(query.id);
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns list of orders ',
  })
  @Get('orders/filter')
  getOrdersByUser(@Query() query: {uid: string, src: string, des: string, limit: number, currPage: number}) {
    return this.orderService.findByUser(query.uid, query.src, query.des, query.limit, query.currPage);;
  }

  @ApiOkResponse({
    status: 200,
    description: 'returns list of orders ',
  })
  @Get('orders/users/statistics')
  getStatisticByUser(@Query() query) {
    return this.orderService.statisticsByUser(query.id);
  }
}
