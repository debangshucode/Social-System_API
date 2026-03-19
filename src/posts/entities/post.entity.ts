import { Comment } from "src/comments/entities/comment.entity";
import { Like } from "src/likes/entities/like.entity";
import { Profile } from "src/profiles/entities/profile.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    content:string;

    @Column()
    created_at: Date;

    @Column()
    updated_at : Date;
    
    @Column()
    deleted_at :Date;
    
    @ManyToOne(()=>Profile,(profile)=>profile.post)
    profile : Profile;

    @OneToMany(()=>Comment,(comments)=>comments.post)
    comments:Comment[];

    @OneToMany(()=>Like,(likes)=>likes.post)
    likes:Like[];
}
