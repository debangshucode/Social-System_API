import { Comment } from "src/comments/entities/comment.entity";
import { Like } from "src/likes/entities/like.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { Column,UpdateDateColumn, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    content:string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at : Date;
    
    @DeleteDateColumn()
    deleted_at :Date;
    
    @ManyToOne(()=>Profile,(profile)=>profile.posts)
    profile : Profile;

    @OneToMany(()=>Comment,(comments)=>comments.post)
    comments:Comment[];

    @OneToMany(()=>Like,(likes)=>likes.post)
    likes:Like[];
}
