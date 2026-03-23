import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, JoinColumn, OneToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Post } from "../../posts/entities/post.entity";
import { Comment } from "../../comments/entities/comment.entity";
import { Like } from "../../likes/entities/like.entity";
@Entity('profiles')
export class Profile {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    user_name: string

    @Column({
        type: 'text',
        nullable: true
    })
    bio: string | null

    @Column({ type: 'text', nullable: true })
    avatar_url: string | null;

    @Column({ type: 'varchar', length: 300, nullable: true })
    cloudinary_public_id: string | null;

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @DeleteDateColumn()
    deleted_at: Date

    @OneToOne(() => User, (user) => user.profile)
    @JoinColumn({ name: 'user_id' })
    user: User

    @OneToMany(() => Post, (post) => post.profile)
    posts: Post[]

    @OneToMany(() => Comment, (comments) => comments.profile)
    comments: Comment[]

    @OneToMany(() => Like, (likes) => likes.profile)
    likes: Like[]

}
