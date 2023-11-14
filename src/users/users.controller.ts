import { Controller, Get, Post, Param, Delete, Logger, UseGuards, UseInterceptors, UploadedFile, Req, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/utils/guards/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import RequestWithUser from 'src/auth/interface/requestWithUser.interface';

@ApiTags('Users')
@Controller('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  } 

  @ApiOkResponse({
    status: 200,
    description: 'returns User ',
  })
  @UseGuards(AccessTokenGuard)
  @Get('me')
  getCurrentUser(@Req() req: RequestWithUser) {
    const user = this.usersService.findById(req.user['sub'])
    return user
  }

  @Get('me/location')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch('update/avatar')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: RequestWithUser) {
    
    return this.usersService.updateAvatar(req.user['sub'], file);
  }

  @Patch('update/location')
  @UseGuards(AccessTokenGuard)
  updateLocation(@Req() req: RequestWithUser) {
    return this.usersService.updateLocation(req.user['sub'], req.body);
  }

  @Patch('update')
  @UseGuards(AccessTokenGuard)
  update(@Req() req: RequestWithUser) {
    return this.usersService.update(req.user['sub'], req.body);
  }

  @Get()
  getAll() {
    return this.usersService.findAll();
  }

}
