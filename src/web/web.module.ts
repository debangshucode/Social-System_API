import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "src/auth/auth.module";
import { CommentsModule } from "src/comments/comments.module";
import { PostsModule } from "src/posts/posts.module";
import { ProfilesModule } from "src/profiles/profiles.module";
import { WebController } from "./web.controller";
import { WebAuthController } from "./web-auth.controller";
import { webContextService } from "./web-context.service";
import { webAuthGuard } from "./guards/web-auth.guard";
import { RefreshTokenMiddleware } from "./middlewares/refresh-token.middleware";
import { AvatarModule } from "src/avatar/avatar.module";
import { FollowModule } from "src/follow/follow.module";
import { NotificationModule } from "src/notification/notification.module";
import { WebCountsInterceptor } from "./interceptors/web-counts.interceptor";



@Module({
    imports:[
        AuthModule,
        PostsModule,
        ProfilesModule,
        CommentsModule,
        
        AvatarModule,
        FollowModule,
        NotificationModule,
        JwtModule
    ],

    controllers:[WebController,WebAuthController],
    providers:[webContextService,webAuthGuard,RefreshTokenMiddleware,WebCountsInterceptor],
    exports:[RefreshTokenMiddleware]
})

export class WebModule {}