import { ForbiddenException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import JwtPayload from "../../utils/interface/jwtPayload.interface";

@Injectable()
export class AccessTokenStrategyU extends PassportStrategy(Strategy, 'jwt-u') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_SECRET
        })
    }


    validate(payload: JwtPayload) {
        if (payload.role !== 'user') {
            throw new ForbiddenException('Access Denied');
        } else return payload
    }
}