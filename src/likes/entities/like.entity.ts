import { Post } from "src/posts/entities/post.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import {Column,Index, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn ,JoinColumn } from "typeorm";

@Entity('likes')
@Index('unique_active_like', ['profile_id', 'post_id'], {
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
    profile_id: number;

    @Column()
    post_id: number;

    @ManyToOne(() => Profile, (profile) => profile.likes)
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;

    @ManyToOne(() => Post, (post) => post.likes)
    @JoinColumn({ name: 'post_id' })
    post: Post;
}
