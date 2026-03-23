import { IsString, MaxLength, Matches } from 'class-validator';

export class UpdateAvatarDto {
    @IsString()
    @MaxLength(300)
    @Matches(
        /^avatars\/users\/[a-zA-Z0-9_-]+\/avatar_[a-zA-Z0-9_-]+$/,
        { message: 'Invalid public_id format.' }
    )
    public_id: string;
}