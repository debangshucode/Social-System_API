import { Expose, Transform, Type } from 'class-transformer';

class ProfileResponseDto {
  @Expose()
  id: number;

  @Expose()
  user_name: string;

  @Expose()
  avatar: string | null;;
}

export class CommentDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose({ name: 'created_at' })
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  updatedAt: Date;

  @Expose()
  @Type(() => ProfileResponseDto)
  profile: ProfileResponseDto;

  @Expose()
  @Transform(({obj})=>obj.post?.id)
  postId: number;
}