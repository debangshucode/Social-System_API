import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[TypeOrmModule.forFeature([Profile]),UsersModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports:[ProfilesService]
})
export class ProfilesModule {}
