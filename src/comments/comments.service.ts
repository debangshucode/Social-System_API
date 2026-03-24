import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { Profile } from 'src/profiles/entities/profile.entity';
import { PostsService } from 'src/posts/posts.service';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { user_role } from 'src/users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private commentRepo: Repository<Comment>, private readonly postService: PostsService) { }


  async create(profileId: number, postId: number, createCommentDto: CreateCommentDto) {
    await this.postService.findPostById(postId);
    const comment = this.commentRepo.create({
      ...createCommentDto,
      post: { id: postId },
      profile: { id: profileId },
    });
    return this.commentRepo.save(comment)
  }

  findAll(query: PaginateQuery, postId: number) {
    return paginate(query, this.commentRepo, {
      where: {
        post: { id: postId }
      },
      relations: ['post', 'profile'],
      sortableColumns: ['created_at'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  async update(profileId: number, id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentRepo.findOne({ where: { id }, relations: { profile: true } });
    if (!comment) throw new NotFoundException('Comment not found !');
    if (comment.profile.id !== profileId) throw new UnauthorizedException('You can only edit comments done by You');

    Object.assign(comment, updateCommentDto);
    return this.commentRepo.save(comment)
  }

  async remove(profile: Profile, id: number) {
    const comment = await this.commentRepo.findOne({ where: { id }, relations: { profile: true, post: { profile: true } } });
    if (!comment) throw new NotFoundException('Comment not found !');
    if (comment.profile.id !== profile.id && comment.post?.profile?.id !== profile.id && profile.user.role !== user_role.ADMIN) throw new UnauthorizedException(`You can't delete this comment`);

    await this.commentRepo.softDelete(comment.id);
    return { message: `Comment successfully deleted` }
  }

  async restore(id: number) {
    const comment = await this.commentRepo.findOne({ where: { id },withDeleted:true});
    if (!comment) throw new NotFoundException('Comment not found !');
    if(comment.deleted_at === null) return {message:'comment is not deleted'};
    
    await this.commentRepo.restore(comment.id);
    return {message:'comment restored successfuly'}
  }
}
