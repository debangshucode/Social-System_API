import { Post } from "src/posts/entities/post.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum notification_type {
    LIKE = 'LIKE',
    COMMENT = 'COMMENT',
    FOLLOW_REQ = 'FOLLOW_REQ',
    FOLLOW_ACP = 'FOLLOW_ACP'
}

@Entity('notifications')
export class Notification {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    receiver_id:number;

    @Column()
    sender_id:number;

    @Column({
        nullable:true
    })
    post_id:number | null;

    @Column({
        nullable: true,
        type: "varchar",
    })
    message: string | null;

    @Column({
        type:'enum',
        enum:notification_type,
    })
    type: notification_type

    @Column({
        default: false
    })
    is_read: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;


    // & FKs

    @ManyToOne(()=>Profile,(profile)=>profile.receivedNotifications)
    @JoinColumn({name:'receiver_id'})
    receiver: Profile;;

    @ManyToOne(()=>Profile,(profile)=>profile.sentNotification)
    @JoinColumn({ name: 'sender_id'})
    sender: Profile;

    @ManyToOne(()=>Post,(post)=>post.notification, {nullable:true})
    @JoinColumn({name:'post_id'})
    post:Post ;
}