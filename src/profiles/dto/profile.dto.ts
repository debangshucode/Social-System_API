import { Expose, Transform } from "class-transformer";

export class ProfileDto {

    @Expose()
    user_name: string;

    @Expose()
    bio: string;

    @Expose()
    avatar_url: string;

    @Expose()
    created_at: Date;

    @Expose()
    @Transform(({obj})=>obj.user?.id)
    user_id:number


}