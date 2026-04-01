import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RoleGuard } from './guards/roles.guard';


@Module({
  imports: [UsersModule,
    PassportModule,
    JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService,JwtAccessStrategy,JwtRefreshStrategy,RoleGuard],
  exports:[AuthService,JwtModule,RoleGuard]
})
export class AuthModule { }
