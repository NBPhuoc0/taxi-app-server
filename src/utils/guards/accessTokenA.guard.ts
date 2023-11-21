import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class AccessTokenGuardA extends AuthGuard('jwt-a') {}