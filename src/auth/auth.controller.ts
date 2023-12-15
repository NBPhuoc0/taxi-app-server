import { ApiTags, ApiBody, ApiCreatedResponse, ApiBearerAuth, ApiOkResponse, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import RequestWithUser from '../utils/interface/requestWithUser.interface';
import { RefreshTokenGuard } from '../utils/guards/refreshToken.guard';
import { AuthDto_send } from './dto/auth_send.dto';
import { AuthDto_verify } from './dto/auth_verify.dto';
import { CreateUserDto_send } from '../users/dto/signup-send.dto';
import { CreateUserDto_verify } from '../users/dto/signup-verify.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { filesUploadDTO } from '.././drivers/dto/files.dto';
import { CreateDriverDto } from '../drivers/dto/create-driver.dto';
import { AuthDto_pass_driver } from './dto/auth_pass_driver.dto';
import RequestWithDriver from 'src/utils/interface/requestWithDriver.interface';
import RequestWithAdmin from 'src/utils/interface/requestWithAdmin.interface';
import { AuthDto_pass_admin } from './dto/auth_pass_admin.dto';
import { AccessTokenGuardD } from 'src/utils/guards/accessTokenD.guard';
import { AccessTokenGuardA } from 'src/utils/guards/accessTokenA.guard';
import { AccessTokenGuardU } from 'src/utils/guards/accessTokenU.guard';
import { UserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('Authentication')
export class AuthController {
    constructor(private authService: AuthService) {}

    // @ApiBody({
    //     description: 'Check if phone number is registered then send OTP',
    //     type: CreateUserDto_send,
        
    // })
    // @ApiOkResponse({
    //     status: 200,
    //     description: 'returns 200 status when phone number is valid and sends OTP',
    // })
    // @Post('user/signupsend')
    // signup_otp(@Body() createUserDto: CreateUserDto_send) {
    //   return this.authService.signUpOTP_send(createUserDto);
    // }

    // @ApiBody({
    //     description: 'Contains properties to create User',
    //     type: CreateUserDto_verify,
        
    // })
    // @ApiCreatedResponse({
    //     status: 201,
    //     description: 'returns 201 status and a refresh and access token when a user successfully signs up',
    // })
    // @Post('user/signupverify')
    // signup_verify(@Body() createUserDto: CreateUserDto_verify) {
    //   return this.authService.signUpOTP_verify(createUserDto);
    // }

    @ApiBody({
        description: 'Contains properties to create User',
        type: CreateUserDto_verify,
        
    })
    @ApiCreatedResponse({
        status: 201,
        description: 'returns 201 status and a refresh and access token when a user successfully signs up',
    })
    @Post('user/signup')
    signup(@Body() createUserDto: UserDto) {
      return this.authService.userPasswordSignup(createUserDto);
    }

    @ApiBody({
        description: 'Contains properties to create User',
        type: CreateUserDto_verify,
        
    })
    @ApiCreatedResponse({
        status: 201,
        description: 'returns 201 status and a refresh and access token when a user successfully signs up',
    })
    @Post('user/signin')
    signin(@Body() data: {phone: string, password: string}) {
      return this.authService.userPasswordSignin(data.phone, data.password);
    }



    @ApiBody({
        description: 'Check if phone number is registered then send OTP',
        type: AuthDto_send,
        
    })
    @ApiOkResponse({
        status: 200,
        description: 'returns 200 status when phone number is valid and sends OTP',
    })
    @Post('user/signinsend')
    signin_otp(@Body() data: AuthDto_send) {
      return this.authService.signInOTP_send(data);
    }

    @ApiBody({
        description: 'Contains properties login a User',
        type: AuthDto_verify,
        
    })
    @ApiOkResponse({
        status: 200,
        description: 'returns 200 status and a refresh and access token when a user successfully signs in',
    })
    @Post('user/signinverify')
    signin_verify(@Body() data: AuthDto_verify) {
      return this.authService.signInOTP_verify(data);
    }
  

    @ApiOkResponse({
        status: 200,
        description: 'returns 200 status and logs a user out',
    })
    @UseGuards(AccessTokenGuardU)
    @Get('user/logout')
    logout(@Req() req: RequestWithUser) {
      this.authService.logoutU(req.user['sub']);
    }

    @ApiOkResponse({
        status: 200,  
        description: 'returns 200 status and return a refresh and access token',
    })
    @UseGuards(RefreshTokenGuard)
    @Get('user/refresh')
    async refreshTokens(@Req() req: RequestWithUser) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        return await this.authService.refreshTokensU(userId, refreshToken)
    }


    @Post('driver/signup')
    @UseInterceptors(FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'vehicleImage', maxCount: 1 },
      { name: 'Cavet_f', maxCount: 1 },
      { name: 'Cavet_b', maxCount: 1 },
      { name: 'identification_card_f', maxCount: 1 },
      { name: 'identification_card_b', maxCount: 1 },
      { name: 'license_image_f', maxCount: 1 },
      { name: 'license_image_b', maxCount: 1 },
    ]))
    signupDriver(
      @UploadedFiles() files: filesUploadDTO,
      @Body() createDriverDto: CreateDriverDto) {
      return this.authService.driverSignup(createDriverDto, files);
    }

    @Post('driver/signin')
    signin_driver(@Body() data: AuthDto_pass_driver) {
      return this.authService.driverSignin(data);
    }

    @Post('driver/passwordreset')
    password_reset_driver(@Body() data: any) {
      return this.authService.driverPasswordReset(data.phone, data.password);
    }

    @UseGuards(AccessTokenGuardD)
    @Get('driver/logout')
    logout_driver(@Req() req: RequestWithDriver) {
      this.authService.logoutD(req.user['sub']);
    }

    @UseGuards(RefreshTokenGuard)
    @Get('driver/refresh')
    async refreshTokens_driver(@Req() req: RequestWithDriver) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        return await this.authService.refreshTokensD(userId, refreshToken)
    }

    @Post('admin/signin')
    signin_admin(@Body() data: AuthDto_pass_admin) {
      return this.authService.adminSignin(data);
    }

    @UseGuards(AccessTokenGuardA)
    @Get('admin/logout')
    logout_admin(@Req() req: RequestWithAdmin) {
      this.authService.logoutA(req.user['sub']);
    }

    @UseGuards(RefreshTokenGuard)
    @Get('admin/refresh')
    async refreshTokens_admin(@Req() req: RequestWithAdmin) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        return await this.authService.refreshTokensA(userId, refreshToken)
    }

}
