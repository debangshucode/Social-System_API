import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { user_role } from "src/users/entities/user.entity";
import {Request} from 'express'

export type JwtPayload = {
    sub: number ;// user_id
    email:string ;
    role:user_role
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy,'jwt') {
    
    constructor(private configService:ConfigService) {
        super({
            jwtFromRequest:ExtractJwt.fromExtractors([
                (req:Request)=>req?.cookies?.['access_token'] ?? null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration:false,
            secretOrKey:configService.get<string>('jwt.accessSecret')!,
        });
    }

    async validate(payload:JwtPayload) {
        return { user_id:payload.sub , email:payload.email, role:payload.role};
    }
}