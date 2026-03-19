import { Entity,Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('profiles')
export class Profile {

    @PrimaryGeneratedColumn()
    id:number

    @Column()
    user_name:string

    @Column()
    bio:string

    @Column()
    avatar_url: string
    
    @Column()
    created_at:Date
    
    @Column()
    deleted_at:Date

    @Column()
    updated_at:Date
}
