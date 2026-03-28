// src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@Injectable()
export class jwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      const req = context.switchToHttp().getRequest<Request>();
      const res = context.switchToHttp().getResponse<Response>();

      const accept = req.headers.accept || '';
      const isHtmlGet = req.method === 'GET' && accept.includes('text/html');
      const hasRefresh = Boolean(req.cookies?.refresh_token);

      if (isHtmlGet && hasRefresh) {
        const next = encodeURIComponent(req.originalUrl || '/profiles/me');
        res.redirect(`/auth/refresh?next=${next}`);
        return false;
      }

      throw err;
    }
  }
}
