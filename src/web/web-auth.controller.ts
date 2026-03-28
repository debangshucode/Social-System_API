// src/web/web-auth.controller.ts
import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService }        from '../auth/auth.service';
import { webContextService }  from './web-context.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Controller()
export class WebAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly contextService:  webContextService,
  ) {}

  // ── Login page ────────────────────────────────────────────────────────
  @Get('/login')
  loginPage(@Res() res: Response) {
    res.render('pages/login', {
      ...this.contextService.build('/login', null, { title: 'Login' }),
      layout: 'layouts/auth',
    });
  }

  // ── Login submit ──────────────────────────────────────────────────────
  @Post('/login')
  async loginSubmit(
    @Body() body: LoginDto,
    @Res()  res:  Response,
  ) {
    try {
      // auth.login returns { accessToken, user } + sets refresh cookie via response
      // We need access to the response to forward the refresh cookie from AuthService.
      // AuthService sets refresh cookie itself (via @Res() or Response injection).
      // Here we call the service method that returns tokens only — the refresh cookie
      // is handled inside AuthController.login via @Res().
      // So: call service directly, set our own access_token cookie.
      const result = await this.authService.login(body);
      res.cookie('access_token', result.tokens.accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge:   15 * 60 * 1000,  
      });

      // Also set the refresh token cookie matching existing path: /auth
      if (result.tokens.refreshToken) {
        res.cookie('refresh_token', result.tokens.refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          path:     '/auth',
          maxAge:   7 * 24 * 60 * 60 * 1000,
        });
      }

      res.redirect('/feed');
    } catch {
      res.render('pages/login', {
        ...this.contextService.build('/login', null, { title: 'Login' }),
        layout: 'layouts/auth',
        error:  'Invalid email or password.',
      });
    }
  }

  // ── Signup page ───────────────────────────────────────────────────────
  @Get('/signup')
  signupPage(@Res() res: Response) {
    res.render('pages/signup', {
      ...this.contextService.build('/signup', null, { title: 'Create account' }),
      layout: 'layouts/auth',
    });
  }

  // ── Signup submit ─────────────────────────────────────────────────────
  @Post('/signup')
  async signupSubmit(
    @Body() body: RegisterDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.register(body);

      res.cookie('access_token', result.tokens.accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge:   15 * 60 * 1000,
      });

      if (result.tokens.refreshToken) {
        res.cookie('refresh_token', result.tokens.refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          path:     '/auth',
          maxAge:   7 * 24 * 60 * 60 * 1000,
        });
      }

      res.redirect('/feed');
    } catch (e) {
      res.render('pages/signup', {
        ...this.contextService.build('/signup', null, { title: 'Create account' }),
        layout: 'layouts/auth',
        error:  e?.message ?? 'Registration failed.',
      });
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────
  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    try {
      if (user?.sub) await this.authService.logout(user.sub);
    } catch { /* already logged out */ }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth' });  // exact path from handoff
    res.redirect('/login');
  }
}