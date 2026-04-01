import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification, notification_type } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class NotificationService {

    constructor(@InjectRepository(Notification) private notificationRepo: Repository<Notification>) { }

    async create(receiverId: number, senderId: number, type: notification_type, message?: string, postId?: number): Promise<Notification | null> {

        if (receiverId === senderId) return null;

        const notification = this.notificationRepo.create({
            receiver_id: receiverId,
            sender_id: senderId,
            type,
            message,
            post_id: postId
        })

        return this.notificationRepo.save(notification)
    }

    async getAllUnread(receiverId: number, query: PaginateQuery) {

        const db = this.notificationRepo.createQueryBuilder('notification')
            .leftJoinAndSelect('notification.receiver', 'receiver')
            .leftJoinAndSelect('notification.sender', 'sender')
            .leftJoinAndSelect('notification.post', 'post')
            .where('notification.receiver_id = :receiverId', { receiverId })
            .andWhere('notification.is_read =:isRead', { isRead: false })

        return paginate(query, db, {
            sortableColumns: ['created_at'],
            defaultSortBy: [['created_at', 'DESC']],
            defaultLimit:2
        })
    }

    async countUnread(receiverId: number) {
        return this.notificationRepo.count({
            where: {
                receiver_id: receiverId,
                is_read: false,
            },
        });
    }

    async readNotification(notificationId: number) {
        const notification = await this.notificationRepo.findOne({ where: { id: notificationId } });
        if (!notification) throw new NotFoundException('notification not found');

        notification.is_read = true;
        return await this.notificationRepo.save(notification)
    }

    // async findPostByNotification(notificationId: number) {
    //     const notification = await this.notificationRepo.findOne({ where: { id: notificationId } ,relations:{post:true}});
    //     if (!notification) throw new NotFoundException('notification not found');

    //     return notification.post_id
    // }

}
