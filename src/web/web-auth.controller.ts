import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { webContextService } from './web-context.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller()
export class WebAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly contextService: webContextService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/login')
  loginPage(@Res() res: Response) {
    res.render('pages/login', {
      ...this.contextService.build('/login', null, { title: 'Login' }),
      layout: 'layouts/auth',
    });
  }

  @Post('/login')
  async loginSubmit(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(body);
      res.cookie('access_token', result.tokens.accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });

      if (result.tokens.refreshToken) {
        res.cookie('refresh_token', result.tokens.refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      res.redirect('/feed');
    } catch(err) {
      res.render('pages/login', {
        ...this.contextService.build('/login', null, { title: 'Login' }),
        layout: 'layouts/auth',
        error: err.message,
      });
    }
  }

  @Get('/signup')
  signupPage(@Res() res: Response) {
    res.render('pages/signup', {
      ...this.contextService.build('/signup', null, { title: 'Create account' }),
      layout: 'layouts/auth',
    });
  }

  @Post('/signup')
  async signupSubmit(@Body() body: RegisterDto, @Res() res: Response) {
    try {
      const result = await this.authService.register(body);

      res.cookie('access_token', result.tokens.accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });

      if (result.tokens.refreshToken) {
        res.cookie('refresh_token', result.tokens.refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      res.redirect('/feed');
    } catch (e) {
      res.render('pages/signup', {
        ...this.contextService.build('/signup', null, { title: 'Create account' }),
        layout: 'layouts/auth',
        error: e?.message ?? 'Registration failed.',
      });
    }
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const userId = this.extractUserId(req);

    try {
      if (userId) await this.authService.logout(userId);
    } catch {}

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('access_token', { path: '/posts' });
    res.clearCookie('refresh_token', { path: '/' });
    res.redirect('/login');
  }

  private extractUserId(req: Request): number | null {
    const access = req.cookies?.access_token as string | undefined;
    const refresh = req.cookies?.refresh_token as string | undefined;

    if (access) {
      try {
        const payload = this.jwtService.verify(access, {
          secret: this.configService.get<string>('jwt.accessSecret'),
          ignoreExpiration: true,
        }) as { sub?: number };

        if (payload?.sub) return payload.sub;
      } catch {}
    }

    if (refresh) {
      try {
        const payload = this.jwtService.verify(refresh, {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        }) as { sub?: number };

        if (payload?.sub) return payload.sub;
      } catch {}
    }

    return null;
  }
}

