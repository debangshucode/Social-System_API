import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, BadRequestException, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import type { Request } from 'express';
import { ProfilesService } from 'src/profiles/profiles.service';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { plainToInstance } from 'class-transformer';
import { CommentDto } from './dto/comments.dto';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { user_role } from 'src/users/entities/user.entity';
@Controller()
@UseGuards(jwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService, private readonly profileService: ProfilesService) { }

  @Post('/posts/:postId/comments')
  async create(@Req() req: Request, @Param('postId', ParseIntPipe) postId: number, @Body() createCommentDto: CreateCommentDto) {
    const { user_id } = req.user as { user_id: number };
    const profile = await this.profileService.findByUserId(user_id)
    if (!profile) throw new BadRequestException('You much create a profile before comment ! Profile not found')
    return this.commentsService.create(profile.id, postId, createCommentDto);
  }

  @Get('/posts/:postId/comments')
  async findAll(@Paginate() query: PaginateQuery, @Param('postId', ParseIntPipe) postId: number) {
    const result = await this.commentsService.findAll(query, postId);
    return {
      ...result,
      data: plainToInstance(CommentDto, result.data, {
        excludeExtraneousValues: true
      })
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.commentsService.findOne(+id);
  // }


  @Patch('/comments/:id')
  @Serialize(CommentDto)
  async update(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Body() updateCommentDto: UpdateCommentDto) {
    const { user_id } = req.user as { user_id: number };
    const profile = await this.profileService.findByUserId(user_id);
    if (!profile) throw new BadRequestException('Profile not found')
    return this.commentsService.update(profile.id, id, updateCommentDto);
  }

  @Delete('/comments/:id')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const { user_id } = req.user as { user_id: number };
    const profile = await this.profileService.findByUserId(user_id);
    if (!profile) throw new BadRequestException('Profile not found')
    return this.commentsService.remove(profile,id);
  }

  @Patch('/admin/comments/:id/restore')
  @UseGuards(RoleGuard)
  @Roles(user_role.ADMIN)
  async restore(@Param('id',ParseIntPipe) id:number){
    return await this.commentsService.restore(id)
  }
}
