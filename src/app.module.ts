import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AvatarModule } from './avatar/avatar.module';
import jwtConfig from './config/jwt.config';
import Joi from 'joi';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WebModule } from './web/web.module';
import { RefreshTokenMiddleware } from './web/middlewares/refresh-token.middleware';



@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000,
          limit: 10
        }
      ]
    }),
    ConfigModule.forRoot({
      isGlobal: true,

      load: [jwtConfig],

      validationSchema: Joi.object({
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
      })
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',

        url: process.env.DATABASE_URL || undefined,

        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

        autoLoadEntities: true,

        migrations: ['dist/db/migrations/*.js'],
        migrationsRun: process.env.NODE_ENV == 'production',

        synchronize: false,

        ssl: process.env.DATABASE_URL ?
          { rejectUnauthorized: false }
          : false,
      }),
    }),

    WebModule, UsersModule, ProfilesModule, PostsModule, CommentsModule, LikesModule, AuthModule, AvatarModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_PIPE,
    useValue: new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }],
})
export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RefreshTokenMiddleware)
      .forRoutes('/', '/feed', '/profile', '/posts/:id',
        '/posts/:id/like', '/posts/:id/unlike',
        '/posts/:id/comment', '/logout')
  }

}
