import { Entity,Column, PrimaryGeneratedColumn,DeleteDateColumn, JoinColumn, OneToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Post } from "../../posts/entities/post.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Like } from "src/likes/entities/like.entity";
@Entity('profiles')
export class Profile {

    @PrimaryGeneratedColumn()
    id:number

    @Column({
        unique:true
    })
    user_name:string

    @Column()
    bio:string

    @Column()
    avatar_url: string
    
    @CreateDateColumn()
    created_at:Date
    
    @DeleteDateColumn()
    deleted_at:Date

    @UpdateDateColumn()
    updated_at:Date

    @OneToOne(()=>User,(user)=>user.profile)
    @JoinColumn()
    user:User

    @OneToMany(()=>Post,(post)=>post.profile)
    posts:Post[]

    @OneToMany(()=>Comment,(comments)=>comments.profile)
    comments:Comment[]

    @OneToMany(()=>Like,(likes)=>likes.profile)
    likes:Like[]

}
