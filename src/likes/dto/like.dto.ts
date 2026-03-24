import { Expose, Transform } from "class-transformer";

export class LikeUserDto {
    @Expose()
    id: number;

    @Expose()
    @Transform(({ obj }) => obj.profile?.user_name)
    user_name: string;

    @Expose()
    @Transform(({ obj }) => obj.profile?.avatar_url)
    avatar_url?: string;
}