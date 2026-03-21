import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { user_role } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    private userService:UsersService,
    private jwtService:JwtService,
    private configService:ConfigService
  ){}

  async register(registerDto:RegisterDto){
    const existing = await this.userService.findByMail(registerDto.email);
    if(existing) throw new ConflictException();

    const hashPassword = await bcrypt.hash(registerDto.password, 12)
    const user = await this.userService.create({...registerDto,password:hashPassword})

    const tokens = await this.generateTokens(user.id,user.email,user.role);
    await this.persistRefreshToken(user.id,tokens.refreshToken);

    return {tokens, user};
  }

  async login(login:LoginDto){
    const user = await this.userService.findByMail(login.email)
    if(!user) throw new UnauthorizedException('Invalid Credientials');
    const password = await bcrypt.compare(login.password,user.password);
    if(!password) throw new UnauthorizedException('Invalid Credientials');

    const tokens = await this.generateTokens(user.id,user.email,user.role);
    await this.persistRefreshToken(user.id,tokens.refreshToken);

    return {tokens, user};
  }

  async refresh(user_id:number,email:string,role:user_role){
    const tokens = await this.generateTokens(user_id,email,role);
    await this.persistRefreshToken(user_id,tokens.refreshToken);

    return tokens;
  }

  async logout(user_id:number) {
    await this.userService.updateRefreshToken(user_id,null);
  }

  private async generateTokens(id:number,email:string,role:user_role){
    const payload = {sub:id , email, role}

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload,{
        secret:this.configService.get('jwt.accessSecret'),
        expiresIn:this.configService.get('jwt.accessExpiry')
      }),

      this.jwtService.signAsync(payload,{
        secret : this.configService.get('jwt.refreshSecret'),
        expiresIn : this.configService.get('jwt.refreshExpiry')
      }),
    ]);

    return {accessToken,refreshToken}
  }

  private async persistRefreshToken(userId:number, rawToken: string) {
    const hashed =  await bcrypt.hash(rawToken,10)
    await this.userService.updateRefreshToken(userId,hashed)
  }
}
