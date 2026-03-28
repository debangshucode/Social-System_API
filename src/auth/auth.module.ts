import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';


@Module({
  imports: [UsersModule,
    PassportModule,
    JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService,JwtAccessStrategy,JwtRefreshStrategy],
  exports:[AuthService,JwtModule]
})
export class AuthModule { }
