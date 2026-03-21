import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { user_role } from "src/users/entities/user.entity";


export type JwtPayload = {
    sub: number ;// user_id
    email:string ;
    role:user_role
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy,'jwt') {
    
    constructor(private configService:ConfigService) {
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey:configService.get<string>('jwt.accessSecret')!,
        });
    }

    async validate(payload:JwtPayload) {
        return { userId:payload.sub , email:payload.email, role:payload.role};
    }
}