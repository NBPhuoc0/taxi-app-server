import { ApiTags, ApiBody, ApiCreatedResponse, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import RequestWithUser from './interface/requestWithUser.interface';
import { AccessTokenGuard } from '../utils/guards/accessToken.guard';
import { RefreshTokenGuard } from '../utils/guards/refreshToken.guard';
import { CreateUserDto_send } from 'src/users/dto/signup-send.dto';
import { CreateUserDto_verify } from 'src/users/dto/signup-verify.dto';
import { AuthDto_send } from './dto/auth_send.dto';
import { AuthDto_verify } from './dto/auth_verify.dto';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('Authentication')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiBody({
        description: 'Check if phone number is registered then send OTP',
        type: CreateUserDto_send,
        
    })
    @ApiOkResponse({
        status: 200,
        description: 'returns 200 status when phone number is valid and sends OTP',
    })
    @Post('signupsend')
    signup(@Body() createUserDto: CreateUserDto_send) {
      return this.authService.signUpOTP_send(createUserDto);
    }

    @ApiBody({
        description: 'Contains properties to create User',
        type: CreateUserDto_verify,
        
    })
    @ApiCreatedResponse({
        status: 201,
        description: 'returns 201 status and a refresh and access token when a user successfully signs up',
    })
    @Post('signupverify')
    signup_verify(@Body() createUserDto: CreateUserDto_verify) {
      return this.authService.signUpOTP_verify(createUserDto);
    }


    @ApiBody({
        description: 'Check if phone number is registered then send OTP',
        type: AuthDto_send,
        
    })
    @ApiOkResponse({
        status: 200,
        description: 'returns 200 status when phone number is valid and sends OTP',
    })
    @Post('signinsend')
    signin(@Body() data: AuthDto_send) {
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
    @Post('signinverify')
    signin_verify(@Body() data: AuthDto_verify) {
      return this.authService.signInOTP_verify(data);
    }
  

    @ApiOkResponse({
        status: 200,
        description: 'returns 200 status and logs a user out',
    })
    @UseGuards(AccessTokenGuard)
    @Get('logout')
    logout(@Req() req: RequestWithUser) {
      this.authService.logout(req.user['sub']);
    }

    @ApiOkResponse({
        status: 200,
        description: 'returns 200 status and return a refresh and access token',
    })
    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    async refreshTokens(@Req() req: RequestWithUser) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        return await this.authService.refreshTokens(userId, refreshToken)
    }


    @ApiOkResponse({
        status: 200,
        description: 'returns 200 status current logged in User object',
    })
    @UseGuards(AccessTokenGuard)
    @Get('me')
    getCurrentUser(@Req() req: RequestWithUser) {
        const user = req.user
        return {
            message: 'success',
            data: {
                ...user
            }
        }
    }

}
