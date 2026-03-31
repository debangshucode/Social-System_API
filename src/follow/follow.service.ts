import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow, follow_status } from './entities/follow.entity';
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
        existing.status = follow_status.PENDING;
        await this.followRepo.save(existing)
        await this.followRepo.softDelete(existing.id);

        return { message: `Successfully unfollowed the user - ${targetId}` }
    }


    findAll(query: PaginateQuery, targetId: number) {
        const db = this.followRepo.createQueryBuilder('follows')
            .leftJoinAndSelect('follows.follower', 'follower')
            .where('follows.following_id = :targetId', { targetId })
            .andWhere('follows.deleted_at IS NULL')
            .andWhere('follows.status = :status', { status: follow_status.ACCEPT })
            .select([
                'follows.id',
                'follower.id',
                'follower.user_name',
                'follower.avatar_url',
                'follows.created_at',
                'follows.status'
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
            .andWhere('follows.status = :status', { status: follow_status.ACCEPT })
            .select([
                'follows.id',
                'following.id',
                'following.user_name',
                'following.avatar_url',
                'follows.created_at',
                'follows.status'
            ]);

        return paginate(query, db, {
            sortableColumns: ['created_at'],
            defaultSortBy: [['created_at', 'DESC']]
        });
    }

    async findFollowingIds(followerId: number) {
        const rows = await this.followRepo.find({
            where: {
                follower_id: followerId,
                status: follow_status.ACCEPT,
            },
            select: ['following_id'],
        });

        return rows.map((r) => r.following_id);
    }


    // pending req
    async findPending(query: PaginateQuery, profileId: number) {
        const db = this.followRepo.createQueryBuilder('follows')
            .leftJoinAndSelect('follows.follower', 'follower')
            .where('follows.following_id = :profileId', { profileId })
            .andWhere('follows.deleted_at IS NULL')
            .andWhere('follows.status = :status', { status: follow_status.PENDING })
            .select([
                'follows.id',
                'follower.id',
                'follower.user_name',
                'follower.avatar_url',
                'follows.created_at',
                'follows.status'
            ]);

        return paginate(query, db, {
            sortableColumns: ['created_at'],
            defaultSortBy: [['created_at', 'DESC']]
        });
    }

    async countPending(profileId: number): Promise<number> {
        return this.followRepo.count({
            where: {
                following_id: profileId,
                status: follow_status.PENDING,
            },
        });
    }



    async isFollowing(currentUserId: number, profileID: number) {
        const following = await this.followRepo.findOne({ where: { follower_id: currentUserId, following_id: profileID, status: follow_status.ACCEPT } });
        if (!following) return false

        return true;
    }

    async acceptFollow(followId: number) {
        const follow = await this.followRepo.findOne({ where: { id: followId, status: follow_status.PENDING } });
        if (!follow) throw new NotFoundException('No follow req found ');

        follow.status = follow_status.ACCEPT;

        return this.followRepo.save(follow)
    }

    async rejectFollow(followId: number) {
        const follow = await this.followRepo.findOne({ where: { id: followId, status: follow_status.PENDING } });
        if (!follow) throw new NotFoundException('No follow req found ');

        return this.followRepo.softDelete(follow.id)
    }
}
