import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { object } from 'joi';
import { Profile } from 'src/profiles/entities/profile.entity';
import { user_role } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private postRepo:Repository<Post>) {}

  private async findOwnedPostOrFail(postid:number,profile:Profile) {
    const post = await this.postRepo.findOne({
      where:{id:postid},
      relations:{profile:true},
    });

    if(!post) throw new NotFoundException("No posts found !");
    if(post.profile.id !== profile.id && profile.user.role !== user_role.ADMIN ) {
      throw new ForbiddenException("You can only modify your own posts")
    }

    return post;
  }


  async create(id:number,createPostDto: CreatePostDto) {
    const post =  this.postRepo.create({...createPostDto,
      profile:{id} as any,
    });
   
    return await this.postRepo.save(post)
  }

  findAll() {
    return `This action returns all posts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  async update(id: number,profile:Profile, updatePostDto: UpdatePostDto) {
    const post =await this.findOwnedPostOrFail(id,profile);
    Object.assign(post,updatePostDto);
    return await this.postRepo.save(post);
  }

  async remove(id: number,profile:Profile) {
    const post = await this.findOwnedPostOrFail(id,profile);
    await this.postRepo.softDelete(post.id);
    return {message:'Post deleted succesfully'};
  }

  async restore (id:number) {
    const post = await this.postRepo.findOne({where:{id},withDeleted:true});
    if(!post) throw new NotFoundException('No post found');
    if(post.deleted_at !== null) return {message:'This post is not deleted'};

    await this.postRepo.restore(post.id);
    return {message :`Successfylly restored post - ${post.id}`};
  }
}
