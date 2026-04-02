import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { media_type, Post } from './entities/post.entity';
import { Profile } from 'src/profiles/entities/profile.entity';
import { user_role } from 'src/users/entities/user.entity';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private postRepo: Repository<Post>) { }

  private async findOwnedPostOrFail(postid: number, profile: Profile) {
    const post = await this.postRepo.findOne({
      where: { id: postid },
      relations: { profile: true },
    });

    if (!post) throw new NotFoundException("No posts found !");
    if (post.profile.id !== profile.id && profile.user.role !== user_role.ADMIN) {
      throw new ForbiddenException("You can only modify your own posts")
    }

    return post;
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const remainingMinutes = diffMinutes % 60;

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if(diffHours < 24) return `${diffHours} hr ago ${remainingMinutes} min ago`;
    if(diffDays >= 1) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return `${diffHours} hr ${remainingMinutes} min ago`;
  }


  async create(id: number, createPostDto: CreatePostDto,
    media?: {
      media_path: string;
      media_type: media_type;
      media_mime: string;
    }
  ) {
    const post = this.postRepo.create({
      ...createPostDto,
      ...(media ?? {}),
      profile: { id } as any,
    });

    return await this.postRepo.save(post)
  }

  async findAll(query: PaginateQuery) {
    const db = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.profile', 'author')
      .leftJoinAndSelect('author.user', 'user')
      .loadRelationCountAndMap('post.likes_count', 'post.likes')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')

    const result = await paginate(query, db, {
      sortableColumns: ['created_at'],
      defaultSortBy: [['created_at', 'DESC']],
      searchableColumns: ['content'],
      filterableColumns: {
        likes_count: [FilterOperator.GT]
      },
      defaultLimit: 2
    })

    result.data = result.data.map((post) => ({
      ...post,
      timeAgo: this.formatTimeAgo(new Date(post.created_at + 'z')),
    }));

    return result;
  }

  async findOne(id: number) {
    const post = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.profile', 'author')
      .leftJoinAndSelect('author.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')          // needed for liked_by_me
      .leftJoinAndSelect('likes.profile', 'likeProfile')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.profile', 'commentAuthor')
      .leftJoinAndSelect('commentAuthor.user', 'commentUser')
      .loadRelationCountAndMap('post.likes_count', 'post.likes')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .where('post.id = :id', { id })
      .orderBy('comments.created_at', 'DESC')
      .getOne();

    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async update(id: number, profile: Profile, updatePostDto: UpdatePostDto) {
    const post = await this.findOwnedPostOrFail(id, profile);
    Object.assign(post, updatePostDto);
    return await this.postRepo.save(post);
  }

  async remove(id: number, profile: Profile) {
    const post = await this.findOwnedPostOrFail(id, profile);
    await this.postRepo.softDelete(post.id);
    return { message: 'Post deleted succesfully' };
  }

  async restore(id: number) {
    const post = await this.postRepo.findOne({ where: { id }, withDeleted: true });
    if (!post) throw new NotFoundException('No post found');
    if (post.deleted_at === null) return { message: 'This post is not deleted' };

    await this.postRepo.restore(post.id);
    return { message: `Successfylly restored post - ${post.id}` };
  }

  async findPostById(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not exist');
    return post;
  }


  async findPostByUser(profileId: number, query: PaginateQuery) {
    const db = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.profile', 'author')
      .leftJoinAndSelect('author.user', 'user')
      .loadRelationCountAndMap('post.likes_count', 'post.likes')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .where('author.id = :profileId', { profileId })

    return paginate(query, db, {
      sortableColumns: ['created_at'],
      defaultSortBy: [['created_at', 'DESC']],
      searchableColumns: ['content'],
      filterableColumns: {
        likes_count: [FilterOperator.GT]
      },
      defaultLimit: 4
    })
  }


  async findPostsByFollowing(query: PaginateQuery, currentUserId: number) {
    const db = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.profile', 'author')
      .leftJoinAndSelect('author.user', 'user')
      .loadRelationCountAndMap('post.likes_count', 'post.likes')
      .loadRelationCountAndMap('post.comments_count', 'post.comments')
      .leftJoin(
        'follows',
        'f',
        'f.following_Id = author.id AND f.follower_Id = :currentUserId',
        { currentUserId }
      )
      .where('(f.status = :status AND f.id IS NOT NULL) OR author.id = :currentUserId', {
        status: 'ACCEPT',
        currentUserId,
      });


    const result = await paginate(query, db, {
      sortableColumns: ['created_at'],
      defaultSortBy: [['created_at', 'DESC']],
      searchableColumns: ['content'],
      filterableColumns: {
        likes_count: [FilterOperator.GT]
      },
      defaultLimit: 2
    })
    result.data = result.data.map((post) => ({
      ...post,
      timeAgo: this.formatTimeAgo(new Date(post.created_at + 'z')),
    }));

    return result;
  }

  async findProfileByPostId(postId: number) {
    const post = await this.postRepo.findOne({ where: { id: postId }, relations: { profile: true } });
    if (!post) throw new NotFoundException('post not found')
    const profileId = post.profile.id;

    return profileId;
  }
}
