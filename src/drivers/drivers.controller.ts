import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { filesUploadDTO } from './dto/files.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('drivers')
@ApiBearerAuth()
@ApiTags('Drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get(':id')
  findById( @Param('id') id: string) {
    return this.driversService.findById(id);
  }

  @Patch('verify/:id')
  verify( @Param('id') id: string, @Body() data: any) {
    return this.driversService.verify(id,data.status);
  }

  @Get(':id/location')
  findById_location( @Param('id') id: string) {
    return this.driversService.findById_location(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

}
