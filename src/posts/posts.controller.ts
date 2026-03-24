import { Controller, Get, Post, Body, Patch, Param, Delete, Req, NotFoundException, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ProfilesService } from 'src/profiles/profiles.service';
import type { Request } from 'express';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PostMapper } from './mapper/post.mapper';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';

@Controller('posts')
@UseGuards(jwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService, private profileService: ProfilesService, private readonly postMapper: PostMapper,) { }


  // * Role : Admin

  @Patch('/restore/:id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.restore(id)
  }

  // * Role : User

  @Post()
  @ApiBearerAuth()
  async create(@Req() req: Request, @Body() createPostDto: CreatePostDto) {
    const { user_id } = req.user as { user_id: number };
    const profile = await this.profileService.findByUserId(user_id);
    if (!profile) throw new NotFoundException('Profile not found');

    return await this.postsService.create(profile.id, createPostDto)
  }

  // todo 
  // ~ Both admin and user
  @Get()
  @ApiBearerAuth()
  async findAll(@Paginate() query:PaginateQuery) {
    const result = await this.postsService.findAll(query);
    return {
      ...result,
      data:result.data.map(post=> this.postMapper.toListItem(post))
    };
  }

  // todo
  // ~ Both admin and user
  @Get(':id')
  @ApiBearerAuth()
  async findOne(@Req() req:Request,@Param('id',ParseIntPipe) id: number) {
    const post = await this.postsService.findOne(id);
    const {user_id} = req.user as {user_id:number};
    const profile = await this.profileService.findByUserId(user_id);
    if(!profile) throw new NotFoundException('Profile not found')
    return this.postMapper.toDetail(post,profile.id)
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
