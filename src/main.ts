import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import {join} from 'path';
import methodOverride from 'method-override';
import express from 'express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors();
  

  app.useStaticAssets(join(__dirname,'..','public'));

  app.setBaseViewsDir(join(__dirname,'..','views'));

  app.setViewEngine('ejs');

  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));


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
