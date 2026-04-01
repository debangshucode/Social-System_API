import { Comment } from "src/comments/entities/comment.entity";
import { Like } from "src/likes/entities/like.entity";
import { Notification } from "src/notification/entities/notification.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { Column, UpdateDateColumn, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

export enum media_type {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO'
}
@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'text'
    })
    content: string;

    @Column({
        nullable: true,
        type:"varchar"
    })
    media_path: string | null;

    @Column({
        type:'enum',
        enum: media_type,
        nullable: true
    })
    media_type: media_type | null;

    @Column({
        nullable: true,
        type:'varchar'
    })
    media_mime: string | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;



    @ManyToOne(() => Profile, (profile) => profile.posts)
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;

    @OneToMany(() => Comment, (comments) => comments.post)
    comments: Comment[];

    @OneToMany(() => Like, (likes) => likes.post)
    likes: Like[];

    @OneToMany(()=> Notification,(notification)=>notification.post)
    notification: Notification[];

    // virtual 
    likes_count?: number;      // runtime only ✔
    comments_count?: number;   // runtime only ✔
}
