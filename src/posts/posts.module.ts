import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { profile } from 'console';
import { ProfilesModule } from 'src/profiles/profiles.module';

@Module({
  imports:[TypeOrmModule.forFeature([Post]),ProfilesModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
