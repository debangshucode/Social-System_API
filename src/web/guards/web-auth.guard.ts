import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";




@Injectable()

export class webAuthGuard implements CanActivate{

    constructor(
        private readonly jwt:JwtService,
        private readonly configService:ConfigService
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();

        const token: string | undefined = req.cookies?.access_token;

        if(!token){
            res.redirect('/login');
            return false;
        }

        try{
            req.user = this.jwt.verify(token,{
                secret:this.configService.get<string>('jwt.accessSecret'),
            })
            return true;
        }
        catch{
            res.clearCookie('access_token');
            res.redirect('/login');
            return false;
        }
    }
}