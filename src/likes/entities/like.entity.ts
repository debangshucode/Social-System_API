import { Post } from "src/posts/entities/post.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import {Column,Index, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn ,JoinColumn } from "typeorm";

@Entity('likes')
@Index('unique_active_like', ['profileId', 'postId'], {
    unique: true,
    where: '"deleted_at" IS NULL',
})
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date

    @DeleteDateColumn()
    deleted_at: Date

    @Column()
    profileId: number;

    @Column()
    postId: number;

    @ManyToOne(() => Profile, (profile) => profile.likes)
    @JoinColumn({ name: 'profileId' })
    profile: Profile;

    @ManyToOne(() => Post, (post) => post.likes)
    @JoinColumn({ name: 'postId' })
    post: Post;
}
