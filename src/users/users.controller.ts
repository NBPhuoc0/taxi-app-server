import { Controller, Get, Post, Param, Delete, Logger, UseGuards, UseInterceptors, UploadedFile, Req, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuardU } from '../utils/guards/accessTokenU.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import RequestWithUser from '../utils/interface/requestWithUser.interface';
import { OrdersService } from 'src/orders/orders.service';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuardU)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
  ) {
  } 

  @ApiOkResponse({
    status: 200,
    description: 'returns User ',
  })
  @Get()
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

  @Post('order')
  createOrder(@Req() req: RequestWithUser, @Body() body: CreateOrderDto) {      
    return this.ordersService.create(req.user['sub'], req.body);    
  }

  @Get('order')
  findOrder(@Req() req: RequestWithUser) {
    return this.ordersService.findByUser(req.user['sub']);
  }

}
