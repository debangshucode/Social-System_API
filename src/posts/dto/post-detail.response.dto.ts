import { ApiProperty } from '@nestjs/swagger';
import { AuthorResponseDto } from './author.response.dto';
import { CommentPreviewResponseDto } from './comment-preview.response.dto';

export class PostDetailResponseDto {
    // all PostListItemResponseDto fields, plus:
    id: number;
    content: string;
    created_at: Date;
    updated_at: Date;
    author: AuthorResponseDto;
    likes_count: number;
    comments_count: number;

    @ApiProperty({ example: true })
    liked_by_me: boolean;

    @ApiProperty({ type: () => [CommentPreviewResponseDto] })
    comments_preview: CommentPreviewResponseDto[];
}