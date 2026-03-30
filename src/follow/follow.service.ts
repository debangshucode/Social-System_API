import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class FollowService {

    constructor(@InjectRepository(Follow) private followRepo: Repository<Follow>) { }

    async create(followerId: number, targetId: number) {
        if (followerId === targetId) throw new BadRequestException('You cannot follow your own account');

        const existing = await this.followRepo.findOne({ where: { follower_id: followerId, following_id: targetId }, withDeleted: true });

        if (existing) {
            if (!existing.deleted_at) {
                return existing;
            }
            await this.followRepo.restore(existing.id)
            return this.followRepo.findOne({ where: { id: existing.id } })
        }

        try {
            const follow = this.followRepo.create({
                follower_id: followerId,
                following_id: targetId
            });

            return this.followRepo.save(follow)
        }
        catch (err) {
            const fallback = await this.followRepo.findOne({ where: { follower_id: followerId, following_id: targetId } });
            return fallback;
        }
    }

    async remove(followerId: number, targetId: number) {
        const existing = await this.followRepo.findOne({ where: { follower_id: followerId, following_id: targetId } });

        if (!existing) {
            return { message: 'Already unfollowed' }
        }

        await this.followRepo.softDelete(existing.id);

        return { message: `Successfully unfollowed the user - ${targetId}` }
    }


    findAll(query: PaginateQuery, targetId: number) {
        const db = this.followRepo.createQueryBuilder('follows')
            .leftJoinAndSelect('follows.follower', 'follower')
            .where('follows.following_id = :targetId', { targetId })
            .andWhere('follows.deleted_at IS NULL')
            .select([
                'follows.id',
                'follower.id',
                'follower.user_name',
                'follower.avatar_url',
                'follows.created_at',
            ]);

        return paginate(query, db, {
            sortableColumns: ['created_at'],
            defaultSortBy: [['created_at', 'DESC']]
        });
    }

    findAllFollowing(query: PaginateQuery, followerId: number) {
        const db = this.followRepo.createQueryBuilder('follows')
            .leftJoinAndSelect('follows.following', 'following')
            .where('follows.follower_id = :followerId', { followerId })
            .andWhere('follows.deleted_at IS NULL')
            .select([
                'follows.id',
                'following.id',
                'following.user_name',
                'following.avatar_url',
                'follows.created_at',
            ]);

        return paginate(query, db, {
            sortableColumns: ['created_at'],
            defaultSortBy: [['created_at', 'DESC']]
        });
    }

    async isFollowing(currentUserId: number, profileID: number) {
        const following = await this.followRepo.findOne({ where: { follower_id: currentUserId, following_id: profileID } });
        if(!following) return false

        return true;
    }
}
