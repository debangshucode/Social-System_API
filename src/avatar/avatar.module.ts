import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { UsersModule } from 'src/users/users.module';
import { CloudinaryProvider } from './cloudinary.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/profiles/entities/profile.entity';
import { ProfilesService } from 'src/profiles/profiles.service';

@Module({
  imports:[UsersModule,TypeOrmModule.forFeature([Profile])],
  controllers: [AvatarController],
  providers: [CloudinaryProvider, AvatarService, ProfilesService],
})
export class AvatarModule {}
