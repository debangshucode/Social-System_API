import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "src/auth/auth.service";
import { Request, Response, NextFunction } from 'express';


@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
    constructor(
        private readonly auth: AuthService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {

        const hasAccess = !!req.cookies?.access_token;
        const hasRefresh = !!req.cookies?.refresh_token;

        if (!hasAccess && hasRefresh) {
            try {
                this.jwt.verify(req.cookies.refresh_token, {
                    secret: this.config.get<string>('jwt.refreshSecret')
                });

                const payload = this.jwt.verify(req.cookies.refresh_token, {
                    secret: this.config.get<string>('jwt.refreshSecret'),
                });

                const { accessToken } = await this.auth.refresh(payload.sub, payload.email, payload.role)

                res.cookie('access_token', accessToken, {
                    httpOnly: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 15 * 60 * 1000,
                })

                req.cookies.access_token = accessToken;
            }
            catch{}
        }
        next();
    }
}
