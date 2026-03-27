import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { object } from 'joi';
import { Profile } from 'src/profiles/entities/profile.entity';
import { user_role } from 'src/users/entities/user.entity';
import { profile } from 'console';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private postRepo: Repository<Post>) { }

  private async findOwnedPostOrFail(postid: number, profile: Profile) {
    const post = await this.postRepo.findOne({
      where: { id: postid },
      relations: { profile: true },
    });

    if (!post) throw new NotFoundException("No posts found !");
    if (post.profile.id !== profile.id && profile.user.role !== user_role.ADMIN) {
      throw new ForbiddenException("You can only modify your own posts")
    }

    return post;
  }


  async create(id: number, createPostDto: CreatePostDto) {
    const post = this.postRepo.create({
      ...createPostDto,
      profile: { id } as any,
    });

    return await this.postRepo.save(post)
  }

  async findAll(query:PaginateQuery) {
    const db =  this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.profile', 'author')
      .leftJoinAndSelect('author.user', 'user')
      .loadRelationCountAndMap('post.likes_count', 'post.likes')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      
      return paginate(query,db,{
        sortableColumns:['created_at'],
        defaultSortBy:[['created_at','DESC']],
        searchableColumns:['content'],
        filterableColumns:{
          likes_count:[FilterOperator.GT]
        }, 
        defaultLimit:2
      })
  }

  async findOne(id: number) {
    const post = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.profile', 'author')
      .leftJoinAndSelect('author.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')          // needed for liked_by_me
      .leftJoinAndSelect('likes.profile', 'likeProfile')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.profile', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.user', 'commentUser')
      .loadRelationCountAndMap('post.likes_count', 'post.likes')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .where('post.id = :id', { id })
      .orderBy('comments.created_at', 'DESC')
      .getOne();

    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async update(id: number, profile: Profile, updatePostDto: UpdatePostDto) {
    const post = await this.findOwnedPostOrFail(id, profile);
    Object.assign(post, updatePostDto);
    return await this.postRepo.save(post);
  }

  async remove(id: number, profile: Profile) {
    const post = await this.findOwnedPostOrFail(id, profile);
    await this.postRepo.softDelete(post.id);
    return { message: 'Post deleted succesfully' };
  }

  async restore(id: number) {
    const post = await this.postRepo.findOne({ where: { id }, withDeleted: true });
    if (!post) throw new NotFoundException('No post found');
    if (post.deleted_at === null) return { message: 'This post is not deleted' };

    await this.postRepo.restore(post.id);
    return { message: `Successfylly restored post - ${post.id}` };
  }

  async findPostById(id:number) {
    const post = await this.postRepo.findOne({where:{id}});
    if(!post) throw new NotFoundException('Post not exist');
    return post;
  }
}
