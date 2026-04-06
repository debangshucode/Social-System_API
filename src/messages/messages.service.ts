import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { ProfilesService } from 'src/profiles/profiles.service';
import { paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class MessagesService {

    constructor(@InjectRepository(Message) private messagesRepo: Repository<Message>,
        private profileService: ProfilesService
    ) { }

    async createMessage(sender_id: number, receiver_id: number, content: string) {
        const sender = await this.profileService.findByProfileId(sender_id);
        const receiver = await this.profileService.findByProfileId(receiver_id);

        if (!sender || !receiver) throw new NotFoundException(`Profile not found sender:${sender?.id} , receiver:${receiver?.id}`);

        if (sender.id === receiver.id) throw new BadRequestException(`Sender and receiver can't be same`);
        if(!content?.trim()) throw new BadRequestException('Message content is empty')

        const message = this.messagesRepo.create({
            content,
            sender_id: sender.id,
            receiver_id: receiver.id,
        })

        return await this.messagesRepo.save(message);
    }

    async getConversationMessages(sender_id: number, receiver_id: number, query: PaginateQuery) {
        const sender = await this.profileService.findByProfileId(sender_id);
        const receiver = await this.profileService.findByProfileId(receiver_id);

        if (!sender || !receiver) throw new NotFoundException(`Profile not found sender:${sender?.id} , receiver:${receiver?.id}`);

        if (sender.id === receiver.id) throw new BadRequestException(`Sender and receiver can't be same`);


        const db = this.messagesRepo
            .createQueryBuilder('messages')
            .leftJoinAndSelect('messages.receiver', 'receiver')
            .leftJoinAndSelect('messages.sender', 'sender')
            .where(
                '(messages.sender_id = :sender_id AND messages.receiver_id = :receiver_id) OR (messages.sender_id = :receiver_id AND messages.receiver_id = :sender_id)',
                { sender_id, receiver_id },
            )
            .andWhere('messages.deleted_at IS NULL');
        return paginate(query, db, {
            sortableColumns: ['created_at'],
            defaultSortBy: [['created_at', 'DESC']]
        })
    }
}
