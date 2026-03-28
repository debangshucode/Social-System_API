import { Controller, Get, Post, Req, Param, Delete, ParseIntPipe, NotFoundException, UseGuards, Res } from '@nestjs/common';
import { LikesService } from './likes.service';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import type { Request, Response } from 'express';
import { ProfilesService } from 'src/profiles/profiles.service';
import { PostsService } from 'src/posts/posts.service';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { LikeUserDto } from './dto/like.dto';
@Controller('posts/:postId/likes')
@UseGuards(jwtAuthGuard)
@ApiBearerAuth()
export class LikesController {
  constructor(private readonly likesService: LikesService, private readonly profileService: ProfilesService, private readonly postService: PostsService) { }

  @Post()
  async create(@Req() req: Request, @Param('postId', ParseIntPipe) id: number, @Res() res: Response) {
    const { user_id } = req.user as { user_id: number };
    const profile = await this.profileService.findByUserId(user_id);
    if (!profile) throw new NotFoundException('Profile not found');
    await this.likesService.create(profile.id, id);
    return res.redirect('/profiles/me')
    // return this.likesService.create(profile.id, id);
  }

  @Get()
  async findAll(@Paginate() query: PaginateQuery, @Param('postId', ParseIntPipe) id: number) {
    const result = await this.likesService.findAll(query, id);
    return {
      ...result,
      data: plainToInstance(LikeUserDto, result.data, {
        excludeExtraneousValues: true,
      })
    }
  }

  @Delete()
  async remove(@Req() req: Request, @Param('postId', ParseIntPipe) id: number ,@Res() res:Response) {
    const { user_id } = req.user as { user_id: number };
    const profile = await this.profileService.findByUserId(user_id);
    if (!profile) throw new NotFoundException('Profile not found');
    await this.likesService.remove(profile.id, id);
    return res.redirect('/profiles/me')
  }
}
