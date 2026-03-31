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
import { FollowService } from "src/follow/follow.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import type { Express } from "express";
import { extname } from "path";
import { media_type } from "src/posts/entities/post.entity";



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

    // & File upload helper functions

    private static postMediaFileFilter(
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
    ) {
        const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'video/mp4',
            'video/webm',
        ];
        if (!allowed.includes(file.mimetype)) {
            return cb(new BadRequestException('Only jpg, png, webp, mp4, webm files are allowed') as any, false);
        }
        cb(null, true);
    }

    private static postMEdiaFilename(
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
    }

    // & File upload helper functions END

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
        let reqCount: null | number;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) {
            reqCount = null;
        }
        else {
            reqCount = await this.followService.countPending(profile.id);
        }
        const result = await this.postsService.findAll(query);
        res.render('pages/feed', this.contextService.build('/feed', user, {
            posts: result.data,
            meta: result.meta,
            link: result.links,
            reqCount
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
        if (!profile) return res.redirect('/profile')
        const reqCount = await this.followService.countPending(profile.id);

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
            reqCount
        }))
    }


    // * ---- Create Post
    // & with file upload
    @Post('/feed/post')
    @UseGuards(webAuthGuard)
    @UseInterceptors(
        FileInterceptor('media', {
            storage: diskStorage({
                destination: './public/uploads/posts',
                filename: WebController.postMEdiaFilename,
            }),
            fileFilter: WebController.postMediaFileFilter,
            limits: { fileSize: 10 * 1024 * 1024 }
        }),
    )
    async createPost(
        @Req() req: Request,
        @Res() res: Response,
        @Body() body: CreatePostDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) throw new NotFoundException('profile not found');

        const media = file ? {
            media_path: `/uploads/posts/${file.filename}`,
            media_type: file.mimetype.startsWith('video/') ? media_type.VIDEO : media_type.IMAGE,
            media_mime: file.mimetype,
        } : undefined;

        try {
            await this.postsService.create(profile.id, body, media);
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
        let reqCount: number | null;
        let hasProfile: boolean;
        const curUserProfile = await this.profileService.findByUserId(user.sub);
        if (!curUserProfile) {
            return res.render('pages/profile', this.contextService.build('/profile', user, {
                title: 'My profile',
                profile: null,
                hasProfile: false,
                isOwnProfile: true,
                reqCount: 0,
                data: [],
                meta: null,
                fData: [],
                fMeta: null,
                flData: [],
                flMeta: null,
            }));
        }

        else {
            reqCount = await this.followService.countPending(curUserProfile.id);
            hasProfile = true;
        }

        const profileID = curUserProfile?.id as number;

        const posts = await this.postsService.findPostByUser(profileID, query);
        const follower = await this.followService.findAll(query, profileID);
        const following = await this.followService.findAllFollowing(query, profileID);

        res.render(
            'pages/profile',
            this.contextService.build('/profile', user, {
                title: curUserProfile?.user_name,
                profile: curUserProfile,
                profileID,
                data: posts.data,
                meta: posts.meta,
                fMeta: follower.meta,
                fData: follower.data,
                flMeta: following.meta,
                flData: following.data,
                curUserProfile,
                hasProfile,
                isOwnProfile: true,
                reqCount
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
            res.redirect('/profile')
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
        let reqCount;
        const profile = await this.profileService.findByProfileId(profileID);
        const curUserProfile = await this.profileService.findByUserId(user.sub);

        if (!curUserProfile) {
            reqCount = null;
            return res.redirect('/profile')
        }
        else {
            reqCount = await this.followService.countPending(curUserProfile.id);
        }

        const posts = await this.postsService.findPostByUser(profileID, query);
        const follower = await this.followService.findAll(query, profileID);
        const following = await this.followService.findAllFollowing(query, profileID);

        const isFollowing = await this.followService.isFollowing(
            curUserProfile.id,
            profileID
        );

        if (profile?.id === curUserProfile.id) {
            res.redirect('/profile')
        }

        else {
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
                isFollowing,
                reqCount
            }));
        }
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

            throw err;
            res.redirect('/profile')
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
            throw err;
            res.redirect('/profile')

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
        let reqCount: number | null;
        const curUserProfile = await this.profileService.findByUserId(user.sub);
        if (!curUserProfile) {
            reqCount = null;
        }
        else {
            reqCount = await this.followService.countPending(curUserProfile.id);
        }

        res.render('pages/search', this.contextService.build('/search', user, {
            title: 'Search users',
            profiles: profiles.data,
            meta: profiles.meta,
            userName,
            data: allProfile.data,
            allMeta: allProfile.meta,
            reqCount
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

    // @Get('/profile/:id/followers')
    // @UseGuards(webAuthGuard)
    // async getAllFollowers(
    //     @Req() req: Request,
    //     @Res() res: Response,
    //     @Param('id', ParseIntPipe) profileID: number,
    //     @Paginate() query:PaginateQuery
    // ) {

    //     const user = (req as any).user;
    //     const profile = await this.profileService.findByProfileId(profileID);
    //     const curUserProfile = await this.profileService.findByUserId(user.sub) as Profile;
    //     const follower = await this.followService.findAll(query, profileID);
    //     const following = await this.followService.findAllFollowing(query, profileID);
    //     const isFollowing = await this.followService.isFollowing(
    //         curUserProfile.id,
    //         profileID
    //     );


    // }


    // * follow req notifications 
    @Get('/notification')
    @UseGuards(webAuthGuard)
    async notification(
        @Req() req: Request,
        @Res() res: Response,
        @Paginate() query: PaginateQuery
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) return res.redirect('/profile');
        const follower = await this.followService.findPending(query, profile.id);
        const reqCount = await this.followService.countPending(profile.id);
        console.log(follower.data)
        res.render(
            'pages/notification',
            this.contextService.build('/notification', user, {
                title: 'notification',
                profile: profile.user_name,
                id: profile.id,
                fMeta: follower.meta,
                fData: follower.data,
                reqCount
            }),
        );

    }


    // *Accept follow req

    @Post('/request/accept/:id')
    @UseGuards(webAuthGuard)
    async acceptReq(
        @Res() res: Response,
        @Param('id', ParseIntPipe) followId: number
    ) {
        await this.followService.acceptFollow(followId);

        res.redirect(`/notification`);
    }

    @Post('/request/reject/:id')
    @UseGuards(webAuthGuard)
    async rejectReq(
        @Res() res: Response,
        @Param('id', ParseIntPipe) followId: number
    ) {
        await this.followService.rejectFollow(followId);

        res.redirect(`/notification`);
    }


}
