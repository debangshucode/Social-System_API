import { Post } from "src/posts/entities/post.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { Column,UpdateDateColumn, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        type:'text'
    })
    content:string;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;

    @DeleteDateColumn()
    deleted_at:Date;

    @ManyToOne(()=>Profile,(profile)=>profile.comments)
    @JoinColumn({name:'profile_id'})
    profile:Profile

    @ManyToOne(()=>Post,(post)=>post.comments)
    @JoinColumn({name:'post_id'})
    post:Post
}
