import { Controller, Get, Post, Param, Delete, Logger, UseGuards, UseInterceptors, UploadedFile, Req, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuardU } from '../utils/guards/accessTokenU.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import RequestWithUser from '../utils/interface/requestWithUser.interface';
import { OrdersService } from 'src/orders/orders.service';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { location } from 'src/utils/interface/location.interface';
import { DriversService } from 'src/drivers/drivers.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuardU)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly driverService: DriversService,
  ) {
  } 

  @ApiOkResponse({
    status: 200,
    description: 'returns User ',
  })
  @Get('userInfor')
  getCurrentUser(@Req() req: RequestWithUser) {
    return this.usersService.findById(req.user['sub'])
  }


  @Patch('update/avatar')
  @UseInterceptors(FileInterceptor('file'))
  updateAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: RequestWithUser) {
    return this.usersService.updateAvatar(req.user['sub'], file);
  }

  @Patch('update/location')
  updateLocation(@Req() req: RequestWithUser) {
    return this.usersService.updateLocation(req.user['sub'], req.body);
  }

  @Patch('update')
  update(@Req() req: RequestWithUser) {
    return this.usersService.update(req.user['sub'], req.body);
  }

  @Patch('setLocation')
  setLocation(@Req() req: RequestWithUser, @Body() body: { lat: number, long: number }) {
    const location = {
      lat: body.lat,
      long: body.long,
    }
    return this.usersService.updateLocation(req.user['sub'], location);
  }

  @Get('getHistory')
  getHistory(@Req() req: RequestWithUser) {
    return this.ordersService.findByid_userOrderComplete(req.user['sub']);
  }

  @Post('getDriverLocationByBR')
  async getDriverLocationByBR(@Body() body: { booking_id: string }) {
    const driver = await this.ordersService.findByid_driver(body.booking_id);
    return this.driverService.findById_location(driver);
  }
    
  @Post('rateDriver')
  async rateDriver(@Body() body: { driver_id: string, rate: number }) {
    return this.driverService.rateDriver(body.driver_id, body.rate);
  }

  @Get('driverRate')
  async driverRate(@Body() body: { id: string}) {
    const driver = await this.ordersService.findByid_driver(body.id);
    return this.driverService.driverRate(driver);
  }

  @Post('order')
  async createOrder(@Req() req: RequestWithUser, @Body() body: CreateOrderDto) {
    return this.ordersService.create(req.user['sub'], body);
  }
  
  @Post('cancelOrder')
  async cancelOrder(@Req() req: RequestWithUser, @Body() body: { booking_id: string }) {
    return this.ordersService.cancelOrder(body.booking_id, req.user['sub']);
  }

  @Post('trigger')
  async trigger(@Req() req: RequestWithUser, @Body() body: any) {
    return this.ordersService.triggerSSEvent(body, req.user['sub']);
  }

}
