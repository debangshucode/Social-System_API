import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { user_role } from 'src/users/entities/user.entity';
import { jwtRefreshGuard } from './guards/jwt-refresh.guard';
import { jwtAuthGuard } from './guards/jwt-auth.guard';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { AuthResponseDto } from './dto/auth.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  @Serialize(AuthResponseDto)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async signup(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { tokens, user } = await this.authService.register(registerDto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @Post('/login')
  @Serialize(AuthResponseDto)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async signin(@Body() logInDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { tokens, user } = await this.authService.login(logInDto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken, user
    };
  }

  @Post('/refresh')
  @UseGuards(jwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh the access token using the refresh cookie' })
  @ApiCookieAuth('refresh_token')
  @ApiOkResponse({ schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } } })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { user_id, email, role } = req.user as { user_id: number, email: string, role: user_role };
    const tokens = await this.authService.refresh(user_id, email, role);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('/logout')
  @UseGuards(jwtAuthGuard)
  @ApiOperation({ summary: 'Logout the current user' })
  @ApiBearerAuth()
  @ApiOkResponse({ schema: { example: { message: 'Logged Out' } } })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { user_id } = req.user as { user_id: number };
    await this.authService.logout(user_id);
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });
    return { message: 'Logged Out' };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    })
  }
}
