import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { webContextService } from "./web-context.service";
import { PostsService } from "src/posts/posts.service";
import { LikesService } from "src/likes/likes.service";
import { CommentsService } from "src/comments/comments.service";
import { ProfilesService } from "src/profiles/profiles.service";
import type { Request, Response } from "express";
import { webAuthGuard } from "./guards/web-auth.guard";
import { Paginate } from "nestjs-paginate";
import type { PaginateQuery } from 'nestjs-paginate'
import { CreateCommentDto } from "src/comments/dto/create-comment.dto";
import { CreatePostDto } from "src/posts/dto/create-post.dto";
import { Profile } from "src/profiles/entities/profile.entity";
import { CreateProfileDto } from "src/profiles/dto/create-profile.dto";
import { UpdateAvatarDto } from "src/avatar/dto/update-avatar.dto";
import { AvatarService } from "src/avatar/avatar.service";
import { error } from "console";
import { FollowService } from "src/follow/follow.service";


@Controller()
export class WebController {

    constructor(
        private readonly contextService: webContextService,
        private readonly postsService: PostsService,
        private readonly profileService: ProfilesService,
        private readonly likesService: LikesService,
        private readonly commentsService: CommentsService,
        private readonly avatarService: AvatarService,
        private readonly followService: FollowService
    ) { }

    // * ----Home Page

    @Get('/')
    home(@Req() req: Request, @Res() res: Response) {
        const user = (req as any).user ?? null;
        res.render('pages/home', this.contextService.build('/', user, { title: 'Home' }));
    }


    // * ----Feed Page
    @Get('/feed')
    @UseGuards(webAuthGuard)
    async feed(
        @Req() req: Request,
        @Res() res: Response,
        @Paginate() query: PaginateQuery,
    ) {
        const user = (req as any).user;

        const result = await this.postsService.findAll(query);
        res.render('pages/feed', this.contextService.build('/feed', user, {
            posts: result.data,
            meta: result.meta,
            link: result.links,
        }))
    }


    // * ----Post Detail Page
    @Get('/posts/:id')
    @UseGuards(webAuthGuard)
    async postDetail(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number,
        @Paginate() query: PaginateQuery
    ) {
        const user = (req as any).user;

        const post = await this.postsService.findOne(id);
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) throw new NotFoundException('Profile not found');

        const postForView = {
            ...post,
            liked_by_me: (post.likes ?? []).some((like) => like.profile?.id === profile.id),
        };

        const comments = await this.commentsService.findAll(query, id)

        res.render('pages/post', this.contextService.build('/feed', user, {
            title: postForView.content.slice(0, 10) ?? 'Post',
            post: postForView,
            comments: comments.data,
            commentsMeta: comments.meta,
            commentsLink: comments.links,
        }))
    }


    // * ---- Create Post
    @Post('/feed/post')
    @UseGuards(webAuthGuard)
    async createPost(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: CreatePostDto
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) throw new NotFoundException('profile not found');

        try {
            await this.postsService.create(profile.id, body);
        }
        catch { }
        res.redirect('/feed')
    }


    // * ----Profile

    @Get('/profile')
    @UseGuards(webAuthGuard)
    async ownProfile(
        @Req() req: Request,
        @Res() res: Response,
        @Paginate() query: PaginateQuery
    ) {
        const user = (req as any).user;

        const curUserProfile = await this.profileService.findOne(user.sub);

        if (!curUserProfile) {
            return res.redirect('/create-profile');
        }

        const profileID = curUserProfile.id;

        const posts = await this.postsService.findPostByUser(profileID, query);
        const follower = await this.followService.findAll(query, profileID);
        const following = await this.followService.findAllFollowing(query, profileID);

        res.render(
            'pages/profile',
            this.contextService.build('/profile', user, {
                title: curUserProfile.user_name,
                profile: curUserProfile,
                profileID,
                data: posts.data,
                meta: posts.meta,
                fMeta: follower.meta,
                fData: follower.data,
                flMeta: following.meta,
                flData: following.data,
                curUserProfile,
                hasProfile: true,
                isOwnProfile: true
            }),
        );
    }

    // * Create profile
    @Post('/profile/create')
    @UseGuards(webAuthGuard)
    async createProfile(@Req() req: Request, @Body() body: CreateProfileDto, @Res() res: Response) {
        const user = (req as any).user;
        let profile: Profile | null = null
        let hasProfile = true;
        try {
            profile = await this.profileService.create(user.sub, body)
            res.render('pages/profile', this.contextService.build('/profile', user, {
                title: profile?.user_name ?? 'My profile',
                profile,
                hasProfile
            }));
        }
        catch (err) {
            throw err;
        }

    }

    // * Profile by id

    @Get('/profile/:id')
    @UseGuards(webAuthGuard)
    async usersProfile(@Req() req: Request, @Res() res: Response, @Paginate() query: PaginateQuery, @Param('id', ParseIntPipe) profileID: number) {
        const user = (req as any).user;
        const profile = await this.profileService.findByProfileId(profileID);
        const curUserProfile = await this.profileService.findByUserId(user.sub) as Profile;
        const posts = await this.postsService.findPostByUser(profileID, query);
        const follower = await this.followService.findAll(query, profileID);
        const following = await this.followService.findAllFollowing(query, profileID);
        const isFollowing = await this.followService.isFollowing(
            curUserProfile.id,
            profileID
        );
        res.render('pages/userProfile', this.contextService.build('/profile', user, {
            title: profile?.user_name,
            profile,
            profileID,
            data: posts.data,
            meta: posts.meta,
            fMeta: follower.meta,
            fData: follower.data,
            flMeta: following.meta,
            flData: following.data,
            isFollowing
        }));
    }

    // * ----update avatar

    @Post('/profile/avatar')
    @UseGuards(webAuthGuard)
    async updateAvatar(@Req() req: Request, @Res() res: Response, @Body() body: UpdateAvatarDto) {
        const user = (req as any).user;
        try {
            await this.avatarService.updateAvatar(user.sub, body.public_id);
            res.redirect('/profile')
        }
        catch (err) {
            res.redirect('/profile')
            throw err;
        }
    }

    // * remove avatar
    @Post('/profile/avatar/remove')
    @UseGuards(webAuthGuard)
    async deleteAvatar(@Req() req: Request, @Res() res: Response) {
        const user = (req as any).user;
        try {
            await this.avatarService.deleteAvatar(user.sub);
            res.redirect('/profile')
        }
        catch (err) {
            res.redirect('/profile')
            throw err;
        }
    }

    // * ----Like 
    @Post('/posts/:id/like')
    @UseGuards(webAuthGuard)
    async like(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) throw new NotFoundException('profile not found');
        try {
            await this.likesService.create(profile.id, id)
        }
        catch { }
        res.redirect(`/posts/${id}`);

    }


    // * ----Unlike

    @Post('/posts/:id/unlike')
    @UseGuards(webAuthGuard)
    async unLike(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) throw new NotFoundException('Profile not found');

        try {
            await this.likesService.remove(profile.id, id);
        }
        catch { }
        res.redirect(`/posts/${id}`);
    }


    // * ----Comments

    @Post('/posts/:id/comment')
    @UseGuards(webAuthGuard)
    async addComment(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CreateCommentDto,
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) throw new NotFoundException('Profile not found');
        try {
            await this.commentsService.create(profile.id, id, { content: body.content });
        } catch { }
        res.redirect(`/posts/${id}`);
    }


    // * ---- Search

    @Get('/search')
    @UseGuards(webAuthGuard)
    async searchUSers(@Req() req: Request, @Res() res: Response, @Query('userName') userName: string, @Paginate() query: PaginateQuery) {
        const user = (req as any).user;
        const profiles = await this.profileService.findByUserName(userName, query);
        const allProfile = await this.profileService.findAll(query);

        res.render('pages/search', this.contextService.build('/search', user, {
            title: 'Search users',
            profiles: profiles.data,
            meta: profiles.meta,
            userName,
            data:allProfile.data,
            allMeta:allProfile.meta
        }));
    }

    // * ---- Follow
    @Post('/profile/:id/follow')
    @UseGuards(webAuthGuard)
    async follow(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) throw new NotFoundException('profile not found');
        try {
            await this.followService.create(profile.id, id)
        }
        catch { }
        res.redirect(`/profile/${id}`);

    }
    @Post('/profile/:id/unfollow')
    @UseGuards(webAuthGuard)
    async unfollow(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number
    ) {

        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) throw new NotFoundException('profile not found');
        try {
            await this.followService.remove(profile.id, id)
        }
        catch { }
        res.redirect(`/profile/${id}`);
    }

    // @Get('/profile/:id/unfollow')
    // @UseGuards(webAuthGuard)
    // async unfollow(
    //     @Req() req: Request,
    //     @Res() res: Response,
    //     @Param('id', ParseIntPipe) id: number
    // ) {

    //     const user = (req as any).user;
    //     const profile = await this.profileService.findByUserId(user.sub);
    //     if (!profile) throw new NotFoundException('profile not found');
    //     try {
    //         await this.followService.remove(profile.id, id)
    //     }
    //     catch { }
    //     res.redirect(`/profile/${id}`);
    // }

}
