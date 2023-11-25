import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategyU } from './strategies/accessTokenU.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DriversModule } from '../drivers/drivers.module';
import { AdminModule } from '../admin/admin.module';
import { AccessTokenStrategyA } from './strategies/accessTokenA.strategy';
import { AccessTokenStrategyD } from './strategies/accessTokenD.strategy';

@Module({
  imports: [
    UsersModule,
    DriversModule,
    AdminModule,
    JwtModule.register({}),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        accountSid: cfg.get('TWILIO_ACCOUNT_SID'),
        authToken: cfg.get('TWILIO_AUTH_TOKEN'),
      }),
      inject: [ConfigService],
    }),],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategyU, AccessTokenStrategyA, AccessTokenStrategyD ,RefreshTokenStrategy]
})
export class AuthModule {}
