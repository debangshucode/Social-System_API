import { Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  signup(signup:SignupDto){

  }

  login(login:LoginDto){

  }

  refresh(refreshToken:RefreshTokenDto){

  }
}
