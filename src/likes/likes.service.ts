import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { profile } from 'console';

@Injectable()
export class LikesService {

  constructor(@InjectRepository(Like) private readonly likeRepo: Repository<Like>) { }

  // *Like
  async create(profileId: number, postId: number) {
    const existing = await this.likeRepo.findOne({ where: { profile_id: profileId, post_id: postId }, withDeleted: true });

    if (existing) {
      if (!existing.deleted_at) {
        return existing;
      }

      await this.likeRepo.restore(existing.id);
      return this.likeRepo.findOne({ where: { id: existing.id } });
    }

    try {
      const like = this.likeRepo.create({
        profile_id: profileId,
        post_id: postId
      })

      return this.likeRepo.save(like);
    }
    catch (err) {
      const fallback = this.likeRepo.findOne({ where: { profile_id: profileId, post_id: postId } });
      return fallback;
    }
  }

  findAll(query: PaginateQuery, postId: number) {
    const db = this.likeRepo.createQueryBuilder('like')
      .leftJoin('like.profile', 'profile')
      .where('like.post.id = :postId', { postId })
      .andWhere('like.deleted_at IS NULL')
      .select([
        'like.id',
        'profile.id',
        'profile.user_name',
        'profile.avatar_url',
        'like.created_at',
      ]);

    return paginate(query,db, {
      sortableColumns: ['created_at'],
      defaultSortBy: [['created_at', 'DESC']]
    });
  }


  // * Unlike
  async remove(profileId: number, postId: number) {
    const existing = await this.likeRepo.findOne({ where: { profile_id: profileId, post_id: postId } });

    if (!existing) throw new NotFoundException('No like found');

    await this.likeRepo.softDelete(existing.id);

    return { message: `Successfully unliked the post - ${postId}` }
  }
}
