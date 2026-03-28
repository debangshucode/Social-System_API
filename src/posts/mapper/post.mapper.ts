import { Injectable } from "@nestjs/common";
import { AuthorResponseDto } from "../dto/author.response.dto";
import { Post } from "../entities/post.entity";
import { PostListItemResponseDto } from "../dto/post-list-item.response.dto";
import { number } from "joi";
import { PostDetailResponseDto } from "../dto/post-detail.response.dto";


@Injectable()

export class PostMapper {

    private toAuthorDto(profile: Post['profile']): AuthorResponseDto {
        return {
            profile_id: profile.id,
            user_name: profile.user_name,
            avatar_url: profile.avatar_url ?? null,
        }
    }

    toListItem(post: Post,reqProfileID: number): PostListItemResponseDto {
        return {
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            updated_at: post.updated_at,
            author: this.toAuthorDto(post.profile),
            likes_count: Number(post.likes_count),
            comments_count: Number(post.comments_count),
             liked_by_me: post.likes.some(l => l.profile.id === reqProfileID),
        }
    }

    toDetail(post: Post, reqProfileID: number): PostDetailResponseDto {
        return {
            ...this.toListItem(post,reqProfileID),
            liked_by_me: post.likes.some(l => l.profile.id === reqProfileID),
            comments_preview: (post.comments ?? []).slice(0, 3).map(c => ({
                id: c.id,
                content: c.content,
                created_at: c.created_at,
                author: this.toAuthorDto(c.profile),
            })),
        }
    }
}