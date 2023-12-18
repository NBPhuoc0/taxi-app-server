import { ConfigService } from '@nestjs/config';
import { UsersService } from './../users/users.service';
import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from 'nestjs-twilio';
import { CreateUserDto_send } from '../users/dto/signup-send.dto';
import { CreateUserDto_verify } from '../users/dto/signup-verify.dto';
import { AuthDto_send } from './dto/auth_send.dto';
import { AuthDto_verify } from './dto/auth_verify.dto';
import * as argon2 from 'argon2'
import { DriversService } from '../drivers/drivers.service';
import { AdminService } from '../admin/admin.service';
import { CreateDriverDto } from '../drivers/dto/create-driver.dto';
import { filesUploadDTO } from '../drivers/dto/files.dto';
import { AuthDto_pass_driver } from './dto/auth_pass_driver.dto';
import { AuthDto_pass_admin } from './dto/auth_pass_admin.dto';
import { UserDto } from 'src/users/dto/create-user.dto';
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private driverService: DriversService,
        private adminService: AdminService,
        private configService: ConfigService,
        private jwtService: JwtService,
        private readonly twilioService: TwilioService,
    ) {}

    logger = new Logger('AuthService');

    // async signUpOTP_send(createUserDto: CreateUserDto_send): Promise<any> {
    //     const user = await this.usersService.findByPhone(createUserDto.phone)

    //     if(user) throw new BadRequestException('Phone number already exists')
    //     else {
    //         const msg = await this.sendOTP(createUserDto.phone);
    //         return msg;
    //     }
        
    // }
    
    // async signUpOTP_verify(createUserDto: CreateUserDto_verify): Promise<any> {
    //     const otp_check = await this.verifyOTP(createUserDto.phone, createUserDto.code);
    //     if (otp_check) {
    //         const newUser = await this.usersService.create({
    //             ...createUserDto,
    //         })
        
    //         const tokens = await this.getTokens(newUser._id, 'user')
    //         await this.updateRefreshTokenU(newUser._id, tokens.refreshToken)
    //         return { ...tokens }
    //     } else {
    //         throw new BadRequestException('OTP is not correct')
    //     }
    // }



    async signUpOTP_Driver(authDto: AuthDto_send) {
        const driver = await this.driverService.findByPhone(authDto.phone);
        if(driver){
            throw new BadRequestException('Phone number already exists')
        } else {
            const msg = await this.sendOTP(authDto.phone);
            return msg;
        }
    }

    async signUp_driver_verifyOTP(authDto: AuthDto_verify) {
        if (await this.verifyOTP(authDto.phone, authDto.code)) {
            return{
                error: false,
                msg: 'OTP is correct',
            }
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
            const tokens = await this.getTokens(user._id, 'user')
            await this.updateRefreshTokenU(user._id, tokens.refreshToken)
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

    async logoutU(userId: string) {
        return this.usersService.update(userId, { refreshToken: null })
    }

    async logoutD(Id: string) {
        return this.driverService.update(Id, { refreshToken: null })
    }

    async logoutA(Id: string) {
        return this.adminService.update(Id, { refreshToken: null })
    }

    async updateRefreshTokenU(userId: string, refreshToken: string) {
        await this.usersService.update(userId, { refreshToken: refreshToken })
    }

    async updateRefreshTokenD(Id: string, refreshToken: string) {
        await this.driverService.update(Id, { refreshToken: refreshToken })
    }
    
    async updateRefreshTokenA(Id: string, refreshToken: string) {
        await this.adminService.update(Id, { refreshToken: refreshToken })
    }

    async getTokens(userId: string,role: string) {
        const [ accessToken, refreshToken ] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    role: role
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: '15m'
                }
            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    role: role
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


    async refreshTokensU(userId: string, refreshToken: string) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken)
          throw new ForbiddenException('Access Denied');
        const refreshTokenMatches = user.refreshToken === refreshToken
        if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
        const tokens = await this.getTokens(user._id, 'user');
        await this.updateRefreshTokenU(user._id, tokens.refreshToken);
        return { ...tokens};
      
    }

    async refreshTokensD(Id: string, refreshToken: string) {
        const driver = await this.driverService.findById(Id);
        if (!driver || !driver.refreshToken)
          throw new ForbiddenException('Access Denied');
        const refreshTokenMatches = driver.refreshToken === refreshToken
        if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
        const tokens = await this.getTokens(driver._id,'driver');
        await this.updateRefreshTokenD(driver._id, tokens.refreshToken);
        return { ...tokens};
    }

    async refreshTokensA(Id: string, refreshToken: string) {
        const admin = await this.adminService.findById(Id);
        if (!admin || !admin.refreshToken)
          throw new ForbiddenException('Access Denied');
        const refreshTokenMatches = admin.refreshToken === refreshToken
        if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
        const tokens = await this.getTokens(admin._id,'admin');
        await this.updateRefreshTokenA(admin._id, tokens.refreshToken);
        return { ...tokens};
    }

    async driverSignup(createDriverDto: CreateDriverDto): Promise<any> {
        const driver = await this.driverService.findByPhone(createDriverDto.phone);
        if(driver) throw new BadRequestException('Phone number already exists');

        const passwordHash = await argon2.hash(createDriverDto.password);

        const newDriver = await this.driverService.create({...createDriverDto,password:passwordHash});

        const token = this.getTokens(newDriver._id,'driver');

        await this.updateRefreshTokenD(newDriver._id, (await token).refreshToken)

        return { ...token };
    }

    async driverSignin(dto: AuthDto_pass_driver) {
        const driver = await this.driverService.findByPhone(dto.phone);
        if(!driver) throw new NotFoundException('Driver does not exist');
        const isPasswordValid = await argon2.verify(driver.password, dto.password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
        const tokens = await this.getTokens(driver._id, 'driver');
        await this.updateRefreshTokenD(driver._id, tokens.refreshToken);
        return { ...tokens };
    }

    async adminSignin(dto: AuthDto_pass_admin) {
        const admin = await this.adminService.findByUsername(dto.username);
        if(!admin) throw new NotFoundException('Admin does not exist');
        const isPasswordValid = admin.password === dto.password;
        if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
        const tokens = await this.getTokens(admin._id, 'admin');
        await this.updateRefreshTokenA(admin._id, tokens.refreshToken);
        return { ...tokens };
    }

    async driverPasswordReset(phone: string, password: string) {
        const driver = await this.driverService.findByPhone(phone);
        if(!driver) throw new NotFoundException('Driver does not exist');
        // const isPasswordValid = await argon2.verify(driver.password, dto.password);
        // if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
        // this.logger.log(driver.toJSON());
        const passwordHash = await argon2.hash(password);
        await this.driverService.update(driver._id, {password: passwordHash});
        return 'Password reset successfully';
    }

    async userPasswordSignin(phone: string, password: string) {
        const user = await this.usersService.findByPhone(phone);
        if(!user) throw new NotFoundException('User does not exist');
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
        const tokens = await this.getTokens(user._id, 'user');
        await this.updateRefreshTokenU(user._id, tokens.refreshToken);
        return { ...tokens };
    }

    async userPasswordSignup(user: UserDto) {
        const user_check = await this.usersService.findByPhone(user.phone);
        if(user_check) throw new BadRequestException('Phone number already exists');
        
        const passwordHash = await argon2.hash(user.password);
        const newUser = await this.usersService.create({
            ...user,
            password: passwordHash
        })
    
        const tokens = await this.getTokens(newUser._id, 'user')
        await this.updateRefreshTokenU(newUser._id, tokens.refreshToken)
        return { ...tokens }
    }

}
