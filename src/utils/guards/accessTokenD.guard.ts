import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class AccessTokenGuardD extends AuthGuard('jwt-d') {}