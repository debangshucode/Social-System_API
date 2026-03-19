import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body() signUpDto: SignupDto) {
    return this.authService.signup(signUpDto);
  }

  @Post('/login')
  signin(@Body() logInDto: LoginDto) {
    return this.authService.login(logInDto)
  }
  
  @Post('/refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto){
    return this.authService.refresh(refreshTokenDto)
  }
}
