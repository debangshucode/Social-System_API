import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { Request } from "express";
import { user_role } from "src/users/entities/user.entity";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';


@Injectable()
export class JwtRefreshStrategy extends PassportStrategy (Strategy,'jwt-refresh') {

    constructor(
        private configService:ConfigService,
        private userService:UsersService
    ) {
        super({
            jwtFromRequest : ExtractJwt.fromExtractors([
                (req:Request)=> req?.cookies?.['refresh_token'] ?? null,
            ]),
            ignoreExpiration:false,
            secretOrKey:configService.get<string>('jwt.refreshSecret')!,
            passReqToCallback:true,
        })
    }
    
    async validate(req:Request, payload:{sub:number,email:string,role:user_role}) {

        const rawRefreshToken = req.cookies?.['refresh_token'];
        if(!rawRefreshToken) throw new UnauthorizedException();

        const user = await this.userService.findOne(payload.sub);
        if(!user || !user.refreshToken) throw new UnauthorizedException();


        const tokenMatch = await bcrypt.compare(rawRefreshToken,user.refreshToken);
        if(!tokenMatch) throw new UnauthorizedException();

        return {user_id :payload.sub , email: payload.email , role: payload.role}

    }
}