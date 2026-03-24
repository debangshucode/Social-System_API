import { Controller, Get, Post, Body, Patch, Param, Delete, Req, NotFoundException, UseGuards, ParseIntPipe } from '@nestjs/common';
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
  constructor(private readonly postsService: PostsService, private profileService: ProfilesService) { }


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
  findAll() {
    return this.postsService.findAll();
  }

  // todo
  // ~ Both admin and user
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
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
