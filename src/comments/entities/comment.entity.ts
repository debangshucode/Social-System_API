import { Post } from "src/posts/entities/post.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    content:string;

    @Column()
    created_at:Date;

    @Column()
    updated_at:Date;

    @Column()
    deleted_at:Date;

    @ManyToOne(()=>Profile,(profile)=>profile.comments)
    profile:Profile

    @ManyToOne(()=>Post,(post)=>post.comments)
    post:Post
}
