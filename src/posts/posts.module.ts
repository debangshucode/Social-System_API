import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { profile } from 'console';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { PostMapper } from './mapper/post.mapper';

@Module({
  imports:[TypeOrmModule.forFeature([Post]),forwardRef(()=>ProfilesModule)],
  controllers: [PostsController],
  providers: [PostsService,PostMapper],
  exports:[PostsService,PostMapper]
})
export class PostsModule {}
