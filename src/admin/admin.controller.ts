import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiBearerAuth()
@ApiTags('Administration')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  @Post()
  create_admin(@Body() createAdminDto: any) {
    return this.adminService.create(createAdminDto);
  }
}
