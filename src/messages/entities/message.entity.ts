import { Profile } from "src/profiles/entities/profile.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum message_status {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
}


@Entity('messages')
export class Message {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'text'
    })
    content: string;

    @Column({
        type: 'enum',
        enum: message_status,
        default: message_status.PENDING
    })
    status: message_status;

    @Column({
        default: false
    })
    read: boolean;


    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;


    @ManyToOne(() => Profile, (profile) => profile.receivedMessages)
    @JoinColumn({ name: 'receiver_id' })
    receiver: Profile;

    @ManyToOne(() => Profile, (profile) => profile.sentMessages)
    @JoinColumn({ name: 'sender_id' })
    sender: Profile;

}