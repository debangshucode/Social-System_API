import { Profile } from "src/profiles/entities/profile.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
}
