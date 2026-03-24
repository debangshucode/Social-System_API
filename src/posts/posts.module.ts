import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { profile } from 'console';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { PostMapper } from './mapper/post.mapper';

@Module({
  imports:[TypeOrmModule.forFeature([Post]),ProfilesModule],
  controllers: [PostsController],
  providers: [PostsService,PostMapper],
  exports:[PostsService]
})
export class PostsModule {}
