import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuardA } from 'src/utils/guards/accessTokenA.guard';
import { UsersService } from 'src/users/users.service';
import { DriversService } from 'src/drivers/drivers.service';
import { OrdersService } from 'src/orders/orders.service';

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
  ) {}


  @Post()
  create_admin(@Body() createAdminDto: any) {
    return this.adminService.create(createAdminDto);
  }
}
