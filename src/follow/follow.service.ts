import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow, follow_status } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { Cron, CronExpression } from '@nestjs/schedule';

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
            const follow = await this.followRepo.findOne({ where: { id: existing.id } });
            if (!follow) throw new NotFoundException('No follow found ');
            follow.status = follow_status.PENDING;
            await this.followRepo.save(follow)
            return follow;
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
        existing.status = follow_status.REJECT;
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
            .andWhere('follower.id IS NOT NULL')
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
            defaultSortBy: [['created_at', 'DESC']],
            defaultLimit: 2
        });
    }

    findAllFollowing(query: PaginateQuery, followerId: number) {
        const db = this.followRepo.createQueryBuilder('follows')
            .leftJoinAndSelect('follows.following', 'following')
            .where('follows.follower_id = :followerId', { followerId })
            .andWhere('follows.deleted_at IS NULL')
            .andWhere('follows.status = :status', { status: follow_status.ACCEPT })
            .andWhere('following.id IS NOT NULL')
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
            defaultSortBy: [['created_at', 'DESC']],
            defaultLimit: 2
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

    // @Cron(CronExpression.EVERY_10_SECONDS)
    // async rejectRequest(): Promise<void> {
    //     await this.followRepo
    //         .createQueryBuilder()
    //         .update()
    //         .set({ status: follow_status.REJECT })
    //         .set({ deleted_at: new Date() })
    //         .where('status = :status AND created_at < :cutoff', { status: follow_status.PENDING, cutoff: new Date(Date.now() - 24 * 60 * 60 * 1000) })
    //         .execute();
    // }

    async countPending(profileId: number): Promise<number> {
        return this.followRepo.count({
            where: {
                following_id: profileId,
                status: follow_status.PENDING,
            },
        });
    }



    async isFollowing(currentUserId: number, profileID: number) {
        const follow = await this.followRepo.findOne({ where: { follower_id: currentUserId, following_id: profileID } });
        if (!follow) return false

        return follow.status;
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
        follow.status = follow_status.REJECT;
        await this.followRepo.save(follow);
        return this.followRepo.softDelete(follow.id)
    }

    async findFollowerByFollowId(followId: number) {
        const follow = await this.followRepo.findOne({ where: { id: followId, status: follow_status.PENDING } });
        if (!follow) throw new NotFoundException('no follow req found')
        const reqProfileId = follow.follower_id;
        return reqProfileId;
    }


    async canAccess(curPfId: number, ownerPfID: number) {
        if (curPfId === ownerPfID) return true

        const follow = await this.followRepo.findOne({
            where: {
                follower_id: curPfId,
                following_id: ownerPfID,
                status: follow_status.ACCEPT,
            }
        })

        return !!follow;
    }
}
