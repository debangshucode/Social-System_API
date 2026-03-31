import { Profile } from "src/profiles/entities/profile.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


export enum follow_status {
    ACCEPT = 'ACCEPT',
    REJECT = 'REJECT',
    PENDING = 'PENDING'
}
@Entity('follows')
@Index('unique_active_follow', ['follower_id', 'following_id'], {
    unique: true,
    where: '"deleted_at" IS NULL',
})
export class Follow {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    follower_id: number;

    @Column()
    following_id: number;

    @ManyToOne(() => Profile, (profile) => profile.followings)
    @JoinColumn({ name: 'follower_id' })
    follower: Profile;

    @ManyToOne(() => Profile, (profile) => profile.followers)
    @JoinColumn({ name: 'following_id' })
    following: Profile;

    @Column({
        type: 'enum',
        enum: follow_status,
        default: follow_status.PENDING
    })
    status: follow_status

    @CreateDateColumn()
    created_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
