import { ConfigService } from '@nestjs/config';
import { UsersService } from './../users/users.service';
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt';
import JwtPayload from './interface/jwtPayload.interface';
import { TwilioService } from 'nestjs-twilio';
import { CreateUserDto_send } from 'src/users/dto/signup-send.dto';
import { CreateUserDto_verify } from 'src/users/dto/signup-verify.dto';
import { AuthDto_send } from './dto/auth_send.dto';
import { AuthDto_verify } from './dto/auth_verify.dto';
import { UserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private configService: ConfigService,
        private jwtService: JwtService,
        private readonly twilioService: TwilioService
    ) {}

    logger = new Logger('AuthService');

    async signUpOTP_send(createUserDto: CreateUserDto_send): Promise<any> {
        const user = await this.usersService.findByPhone(createUserDto.phone)

        if(user) throw new BadRequestException('Phone number already exists')
        else {
            const msg = await this.sendOTP(createUserDto.phone);
            return msg;
        }
        
    }
    
    async signUpOTP_verify(createUserDto: CreateUserDto_verify): Promise<any> {
        const otp_check = await this.verifyOTP(createUserDto.phone, createUserDto.code);
        if (otp_check) {
            const newUser = await this.usersService.create({
                ...createUserDto,
            })
        
            const tokens = await this.getTokens(newUser._id, newUser.phone)
            await this.updateRefreshToken(newUser._id, tokens.refreshToken)
            return { ...tokens }
        } else {
            throw new BadRequestException('OTP is not correct')
        }
    }



    async signInOTP_send(authDto: AuthDto_send) {
        const user = await this.usersService.findByPhone(authDto.phone)

        if(!user) throw new NotFoundException('User does not exist')
        else {
            const msg = await this.sendOTP(authDto.phone);
            return msg;
        }
    }

    async signInOTP_verify(authDto: AuthDto_verify) {
        if (await this.verifyOTP(authDto.phone, authDto.code)) {
            const user = await this.usersService.findByPhone(authDto.phone)
            const tokens = await this.getTokens(user._id, user.phone)
            await this.updateRefreshToken(user._id, tokens.refreshToken)
            return { ...tokens }
        } else {
            throw new BadRequestException('OTP is not correct')
        }
        // return this.verifyOTP(authDto.phone, authDto.code);
    }



    async sendOTP(phone: string) {
        let msg ;
        try {
            await this.twilioService.client.verify.v2
                .services(this.configService.get('TWILIO_VERIFY_SERVICE_SID'))
                .verifications.create({to: phone, channel: 'sms'})
                .then(verifications => { msg = verifications});
        } catch (error) {
            this.logger.log(error);
            return error;
        }
        return msg;
    }

    async verifyOTP(phone: string, code: string) {
        this.logger.log('verifyOTP: '.concat(code));
        let msg;
        try {
            await this.twilioService.client.verify.v2
                .services(this.configService.get('TWILIO_VERIFY_SERVICE_SID'))
                .verificationChecks.create({to: phone, code: code})
                .then(verification_check => { msg = verification_check});
            if (msg.status === 'approved') {
                this.logger.log('ố dè');
                return true;
            } else {
                this.logger.log('nuh uh');
                return false;
            }
        } catch (error) {
            this.logger.log(error);
            return false;
        }
    }

    async logout(userId: string) {
        return this.usersService.update(userId, { refreshToken: null })
    }

    async hashData(data: string) {
        return argon2.hash(data)
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await this.hashData(refreshToken)

        await this.usersService.update(userId, { refreshToken: hashedRefreshToken })
    }

    async getTokens(userId: string, phone: string) {
        const [ accessToken, refreshToken ] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    phone
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: '15m'
                }
            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    phone
                },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: '7d'
                }
            )
        ])

        return {
            accessToken,
            refreshToken
        }
    }


    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken)
          throw new ForbiddenException('Access Denied');
        const refreshTokenMatches = await argon2.verify(
          user.refreshToken,
          refreshToken,
        );
        if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
        const tokens = await this.getTokens(user._id, user.email);
        await this.updateRefreshToken(user._id, tokens.refreshToken);
        return { ...tokens, ...user };
      
    }


    public async getUserFromAuthenticationToken(token: string) {
        const payload: JwtPayload = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        });
        
        const userId = payload.sub

        if (userId) {
            return this.usersService.findById(userId);
        }
      }

}
