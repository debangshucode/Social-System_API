import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import expressLayouts from 'express-ejs-layouts'
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';




async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors();

  //*1  ejs layout set-up
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.use(expressLayouts);
  app.set('layout', 'layouts/layout');
  app.set('layout extractStyles', true);
  app.set('layout extractScripts', true);
  //*1 

  // *2 use static assets 
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // *2

  // *3 Global API prefix — SSR routes excluded
  app.setGlobalPrefix('api', {
    exclude: ['/', '/login', '/signup', '/feed', '/profile','/profile/create', '/logout', 'profile/:id','/profile/:id/follow','/profile/:id/unfollow',
      '/feed/post','/notification','/request/accept/:id','/request/reject/:id','/profile/edit','/requests','/notification/:id/read','/admin/profiles/:id/deactivate',
      'posts/:id', 'posts/:id/like','/profile/avatar/remove','/search', 'posts/:id/unlike','/profile/avatar','/posts/:id/delete','/admin',
      'posts/:id/comment'],
  });
  // *3


  const swaggerConfig = new DocumentBuilder()
    .setTitle('Social System API')
    .setDescription('API documentation for the Social System project')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
