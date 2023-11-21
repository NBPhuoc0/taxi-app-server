import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class AccessTokenGuardU extends AuthGuard('jwt-u') {}