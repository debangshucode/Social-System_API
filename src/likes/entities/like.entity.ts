import { Post } from "src/posts/entities/post.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('likes')
export class Like {
    @PrimaryGeneratedColumn()
    id:number;
    
    @CreateDateColumn()
    created_at:Date

    @DeleteDateColumn()
    deleted_at:Date

    @ManyToOne(()=>Profile,(profile)=>profile.likes)
    profile:Profile;

    @ManyToOne(()=>Post,(post)=>post.likes)
    post:Post;
}
