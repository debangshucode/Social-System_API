import { first } from "rxjs";
import { PrimaryGeneratedColumn,Column } from "typeorm";


export enum user_role {
    ADMIN = 'ADMIN',
    USER = 'USER'
}
export class User {
    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique:true})
    email:string;

    @Column()
    password:string;

    @Column()
    first_name:string

    @Column()
    last_name:string

    @Column({length:10})
    phone_number:string

    @Column({
        type:'enum',
        enum:user_role,
        default:user_role.USER
    })
    role:user_role

    created_at:Date

}
