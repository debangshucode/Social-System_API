import { ApiProperty } from '@nestjs/swagger';
import { AuthorResponseDto } from './author.response.dto';

export class PostListItemResponseDto {
    @ApiProperty({ example: 1 })
    id: number;
    @ApiProperty({ example: 'Hello world' })
    content: string;
    @ApiProperty()
    created_at: Date;
    @ApiProperty()
    updated_at: Date;

    @ApiProperty({ type: () => AuthorResponseDto })
    author: AuthorResponseDto;

    @ApiProperty({ example: 10 })
    likes_count: number;
    @ApiProperty({ example: 3 })
    comments_count: number;
    // ← No liked_by_me — too expensive for list, requires full likes join
}