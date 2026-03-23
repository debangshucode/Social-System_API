import { Controller, Get, Post, Body, Patch, Param, Delete,Req, NotFoundException, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ProfilesService } from 'src/profiles/profiles.service';
import type { Request } from 'express';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('posts')
@UseGuards(jwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService,private profileService:ProfilesService) {}

  
  @Post()
  @ApiBearerAuth()
  async create(@Req() req:Request,@Body() createPostDto: CreatePostDto) {
    const {user_id} = req.user as {user_id:number};
    const profile = await this.profileService.findByUserId(user_id);
    if(!profile) throw new NotFoundException('Profile not found');

    return await this.postsService.create(profile.id,createPostDto)
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
