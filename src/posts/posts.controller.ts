import { Controller, Get, Post, Body, Patch, Param, Delete, Req, NotFoundException, UseGuards, ParseIntPipe, Res, Render, Inject, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ProfilesService } from 'src/profiles/profiles.service';
import type { Request, Response } from 'express';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PostMapper } from './mapper/post.mapper';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { user_role } from 'src/users/entities/user.entity';

@Controller('posts')
@UseGuards(jwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService,@Inject(forwardRef(()=>ProfilesService)) private profileService: ProfilesService, private readonly postMapper: PostMapper,) { }


  // * Role : Admin

  @Patch('/restore/:id')
  @UseGuards(RoleGuard)
  @Roles(user_role.ADMIN)
  @ApiBearerAuth()
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.restore(id)
  }


  // * ejs
  @Get('/upload')
  uploadPostpage(@Res() res: Response) {
    res.render('post/uploadPost', {
      title: 'Upload post',
      error: null
    })
  }

  // * Role : User

  @Post()
  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard)
  async create(@Req() req: Request, @Body() createPostDto: CreatePostDto, @Res() res: Response) {
    try {
      const { user_id } = req.user as { user_id: number };
      const profile = await this.profileService.findByUserId(user_id);
      if (!profile) throw new NotFoundException('Profile not found');

      await this.postsService.create(profile.id, createPostDto)

      return res.redirect('/profiles/me')
    }
    catch (err) {
      return res.render('post/uploadPost', {
        title: 'Upload post',
        error: err.message || 'Something went wrong',
      });
    }
  }

  // todo 
  // ~ Both admin and user
  @Get()
//  @Render('post/listPosts')
  async findAll(@Paginate() query: PaginateQuery, @Req() req:Request) {
    const {user_id} = req.user as {user_id:number};
    const result = await this.postsService.findAll(query);
    const profile = await this.profileService.findByUserId(user_id);
    if(!profile) throw new NotFoundException('no profile found ')
    return {
      ...result,
      data: result.data.map(post => this.postMapper.toListItem(post,profile?.id))
    };
  }

  // todo
  // ~ Both admin and user
  @Get(':id')
  @Render('post/detailPost')
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.findOne(id);
    const { user_id } = req.user as { user_id: number };
    const profile = await this.profileService.findByUserId(user_id);
    if (!profile) throw new NotFoundException('Profile not found')
    return {post:this.postMapper.toDetail(post, profile.id)}
  }

  // ~ Both admin and user
  @Patch(':id')
  @ApiBearerAuth()
  async update(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) {
    const { user_id } = req.user as { user_id: number };

    const profile = await this.profileService.findByUserId(user_id);
    if (!profile) throw new NotFoundException('profile not found')

    return this.postsService.update(id, profile, updatePostDto)
  }

  // ~ Both admin and user
  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const { user_id } = req.user as { user_id: number };

    const profile = await this.profileService.findByUserId(user_id);
    if (!profile) throw new NotFoundException('Profile not found');

    return this.postsService.remove(id, profile);
  }

}
