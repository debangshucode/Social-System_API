import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query, Redirect, Req, Res, UseGuards } from "@nestjs/common";
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
import { NotificationService } from "src/notification/notification.service";
import { notification_type } from "src/notification/entities/notification.entity";
import { WebCountsInterceptor } from "./interceptors/web-counts.interceptor";



@Controller()
export class WebController {

    constructor(
        private readonly contextService: webContextService,
        private readonly postsService: PostsService,
        private readonly profileService: ProfilesService,
        private readonly likesService: LikesService,
        private readonly commentsService: CommentsService,
        private readonly avatarService: AvatarService,
        private readonly followService: FollowService,
        private readonly notificationService: NotificationService,
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
    @UseInterceptors(WebCountsInterceptor)
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
            return res.redirect('/profile')
        }

        // const result = await this.postsService.findAll(query);

        const followingIds = await this.followService.findFollowingIds(profile.id);

        const ids = [profile.id, ...followingIds];

        const result = await this.postsService.findPostsByFollowing(query, ids);

        res.render('pages/feed', this.contextService.build('/feed', user, {
            posts: result.data,
            meta: result.meta,
            link: result.links,
            reqCount: res.locals.reqCount,
            nCount: res.locals.nCount
        }))
    }


    // * ----Post Detail Page
    @Get('/posts/:id')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
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
            reqCount: res.locals.reqCount,
            nCount: res.locals.nCount
        }))
    }


    // * ---- Create Post
    // & with file upload
    @Post('/feed/post')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
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
    @UseInterceptors(WebCountsInterceptor)
    async ownProfile(
        @Req() req: Request,
        @Res() res: Response,
        @Paginate() query: PaginateQuery
    ) {
        const user = (req as any).user;
        let hasProfile: boolean;
        const curUserProfile = await this.profileService.findByUserId(user.sub);
        if (!curUserProfile) {
            return res.render('pages/profile', this.contextService.build('/profile', user, {
                title: 'My profile',
                profile: null,
                hasProfile: false,
                isOwnProfile: true,
                reqCount: res.locals.reqCount,
                nCount: res.locals.nCount,
                data: [],
                meta: null,
                fData: [],
                fMeta: null,
                flData: [],
                flMeta: null,
            }));
        }

        else {
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
                reqCount: res.locals.reqCount,
                nCount: res.locals.nCount,
            }),
        );
    }

    // * Create profile
    @Post('/profile/create')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
    async createProfile(@Req() req: Request, @Body() body: CreateProfileDto, @Res() res: Response) {
        const user = (req as any).user;
        let profile: Profile | null = null
        try {
            profile = await this.profileService.create(user.sub, body)
            res.redirect('/profile')
        }
        catch (err) {
            throw err;
        }

    }

    // * Edit Profile
    @Post('/profile/edit')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
    async editProfile(@Req() req: Request, @Body() body: CreateProfileDto, @Res() res: Response) {
        const user = (req as any).user;
        let profile: Profile | null = null
        try {
            profile = await this.profileService.update(user.sub, body)
            res.redirect('/profile')
        }
        catch (err) {
            throw err;
        }

    }

    // * Profile by id

    @Get('/profile/:id')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
    async usersProfile(@Req() req: Request, @Res() res: Response, @Paginate() query: PaginateQuery, @Param('id', ParseIntPipe) profileID: number) {
        const user = (req as any).user;

        const profile = await this.profileService.findByProfileId(profileID);
        const curUserProfile = await this.profileService.findByUserId(user.sub);

        if (!curUserProfile) {
            return res.redirect('/profile')
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
                reqCount: res.locals.reqCount,
                nCount: res.locals.nCount,
            }));
        }
    }

    // * ----update avatar

    @Post('/profile/avatar')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
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
    @UseInterceptors(WebCountsInterceptor)
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
    @UseInterceptors(WebCountsInterceptor)
    async like(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        const postOwner = await this.postsService.findProfileByPostId(id);
        if (!profile) throw new NotFoundException('profile not found');
        try {
            await this.likesService.create(profile.id, id)
            const message = `${profile.user_name} has liked your post`
            await this.notificationService.create(postOwner, profile.id, notification_type.LIKE, message, id);
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
        const postOwner = await this.postsService.findProfileByPostId(id);
        if (!profile) throw new NotFoundException('Profile not found');
        try {
            await this.commentsService.create(profile.id, id, { content: body.content });
            const message = `${profile.user_name} has commented ${body.content}to your post`
            await this.notificationService.create(postOwner, profile.id, notification_type.COMMENT, message, id);
        } catch { }
        res.redirect(`/posts/${id}`);
    }


    // * ---- Search

    @Get('/search')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
    async searchUSers(@Req() req: Request, @Res() res: Response, @Query('userName') userName: string, @Paginate() query: PaginateQuery) {
        const user = (req as any).user;
        const profiles = await this.profileService.findByUserName(userName, query);
        const allProfile = await this.profileService.findAll(query);

        const curUserProfile = await this.profileService.findByUserId(user.sub);
        if (!curUserProfile) {
            return Redirect('/profile')
        }


        res.render('pages/search', this.contextService.build('/search', user, {
            title: 'Search users',
            profiles: profiles.data,
            meta: profiles.meta,
            userName,
            data: allProfile.data,
            allMeta: allProfile.meta,
            reqCount: res.locals.reqCount,
            nCount: res.locals.nCount,
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

            const message = 'send you follow request'

            await this.notificationService.create(id, profile.id, notification_type.FOLLOW_REQ, message)
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


    // * All notifications 
    @Get('/notification')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
    async notification(
        @Req() req: Request,
        @Res() res: Response,
        @Paginate() query: PaginateQuery
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) return res.redirect('/profile');
        const follower = await this.followService.findPending(query, profile.id);

        const notification = await this.notificationService.getAllUnread(profile.id, query)
        console.log(notification.data)
        res.render(
            'pages/notification',
            this.contextService.build('/notification', user, {
                title: 'notification',
                profile: profile.user_name,
                id: profile.id,
                fMeta: follower.meta,
                fData: follower.data,
                reqCount: res.locals.reqCount,
                nCount: res.locals.nCount,
                nData: notification.data
            }),
        );

    }

    @Get('/requests')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
    async requests(
        @Req() req: Request,
        @Res() res: Response,
        @Paginate() query: PaginateQuery
    ) {
        const user = (req as any).user;
        const profile = await this.profileService.findByUserId(user.sub);
        if (!profile) return res.redirect('/profile');
        const follower = await this.followService.findPending(query, profile.id);
        res.render(
            'pages/request',
            this.contextService.build('/requests', user, {
                title: 'Requests',
                profile: profile.user_name,
                id: profile.id,
                fMeta: follower.meta,
                fData: follower.data,
                reqCount: res.locals.reqCount,
                nCount: res.locals.nCount,
            }),
        );

    }

    // *Accept follow req

    @Post('/request/accept/:id')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
    async acceptReq(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id', ParseIntPipe) followId: number
    ) {

        const user = (req as any).user;

        const userProfile = await this.profileService.findByUserId(user.sub)
        if (!userProfile) return res.redirect('/profile')

        const followerId = await this.followService.findFollowerByFollowId(followId);

        await this.followService.acceptFollow(followId);

        const message = `${userProfile.user_name} has accepted your request`;

        await this.notificationService.create(followerId, userProfile.id, notification_type.FOLLOW_ACP, message);

        res.redirect(`/requests`);
    }

    // *reject follow req

    @Post('/request/reject/:id')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
    async rejectReq(
        @Res() res: Response,
        @Param('id', ParseIntPipe) followId: number
    ) {
        await this.followService.rejectFollow(followId);

        res.redirect(`/requests`);
    }


    // * Read notification
    @Post('/notification/:id/read')
    @UseGuards(webAuthGuard)
    @UseInterceptors(WebCountsInterceptor)
    async readNotifications(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id', ParseIntPipe) id: number
    ) {
        await this.notificationService.readNotification(id)

        if (req.body.profileId && req.body.notificationType === notification_type.FOLLOW_ACP) {
            return res.redirect(`/profile/${req.body.profileId}`)
        }
        else if (req.body.profileId && req.body.notificationType === notification_type.FOLLOW_REQ) {
            return res.redirect(`/requests`)
        }
        else {
            return res.redirect(`/posts/${req.body.postId}`)
        }

    }

}
