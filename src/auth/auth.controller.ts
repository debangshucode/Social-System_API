import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type  { Request,Response } from 'express';
import { user_role } from 'src/users/entities/user.entity';
import { access } from 'fs';
import { jwtRefreshGuard } from './guards/jwt-refresh.guard';
import { jwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() registerDto: RegisterDto, @Res({passthrough:true}) res:Response) {
    const tokens = await this.authService.register(registerDto);
    this.setRefreshCookie(res,tokens.refreshToken);
    return { accessToken:tokens.accessToken};
  }

  @Post('/login')
  async signin(@Body() logInDto: LoginDto ,@Res({passthrough:true}) res:Response) {
    const tokens = await this.authService.login(logInDto);
    this.setRefreshCookie(res,tokens.refreshToken);
    return {accessToken:tokens.accessToken};
  }
  
  @Post('/refresh')
  @UseGuards(jwtRefreshGuard)
  async refresh(@Req() req:Request, @Res({passthrough:true}) res:Response){
    const {user_id,email,role} = req.user as {user_id:number,email:string,role:user_role};
    const tokens = await this.authService.refresh(user_id,email,role);
    this.setRefreshCookie(res,tokens.refreshToken);
    return {accessToken:tokens.accessToken};
  }
  
  @Post('/logout')
  @UseGuards(jwtAuthGuard)
  async logout(@Req() req:Request, @Res({passthrough:true}) res:Response){
    const {user_id} = req.user as {user_id:number};
    await this.authService.logout(user_id);
    res.clearCookie('refresh_token');
    return {message : 'Logged Out'};
  }

  private setRefreshCookie(res:Response, token:string) {
    res.cookie('refresh_token',token,{
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite:'strict',
      maxAge:7*24*60*60*1000,
      path:'/auth/refresh' ,      
    })
  }
}
