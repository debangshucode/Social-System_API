import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe, Render } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { Request } from 'express';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { ProfileDto } from './dto/profile.dto';
import { plainToInstance } from 'class-transformer';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { user_role } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PostsService } from 'src/posts/posts.service';
import { PostMapper } from 'src/posts/mapper/post.mapper';
@Controller('profiles')
@UseGuards(jwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService, private readonly userService:UsersService, private postService:PostsService, private readonly postMapper: PostMapper) { }

  
  // ** role-user
  @Post()
  @ApiBearerAuth()
  @Serialize(ProfileDto)
  create(@Req() req: Request, @Body() createProfileDto: CreateProfileDto) {
    const { user_id } = req.user as { user_id: number };
    return this.profilesService.create(user_id, createProfileDto);
  }

  @Get('/me')
  @UseGuards(jwtAuthGuard)
  @ApiBearerAuth()
  @Render('users/dashboard')
  async findOne(@Req() req: Request,@Paginate() query:PaginateQuery) {
    const { user_id } = req.user as { user_id: number };
    const user = await this.userService.findOne(user_id);
    const profile = await this.profilesService.findOne(user_id);
    const result = await this.postService.findAll(query)
    const posts = {...result,data:result.data.map(post=>this.postMapper.toListItem(post,profile.id))}

    return{user,profile,posts}
  }

  @Patch('/me/edit')
  @ApiBearerAuth()
  @Serialize(ProfileDto)
  update(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
    const { user_id } = req.user as { user_id: number };
    return this.profilesService.update(user_id, updateProfileDto);
  }

  @Delete('/me')
  @ApiBearerAuth()
  remove(@Req() req: Request) {
    const { user_id } = req.user as { user_id: number };
    return this.profilesService.remove(user_id);
  }

  // * role admin

  @Get()
  @UseGuards(RoleGuard)
  @Roles(user_role.ADMIN)
  @ApiBearerAuth()
  async findAll(@Paginate() query: PaginateQuery) {
    const result = await this.profilesService.findAll(query);
    return {
      ...result,
      data: plainToInstance(ProfileDto, result.data, {
        excludeExtraneousValues: true,
      })
    }
  }

  @Post('/create-profile/:id')
  @UseGuards(RoleGuard)
  @Roles(user_role.ADMIN)
  @Serialize(ProfileDto)
  @ApiBearerAuth()
  createUserProfile(@Param('id', ParseIntPipe) id: number, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(id, createProfileDto);
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles(user_role.ADMIN)
  @ApiBearerAuth()
  @Serialize(ProfileDto)
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findOne(id);
  }

  @Patch('/restore/:id')
  @UseGuards(RoleGuard)
  @Roles(user_role.ADMIN)
  @ApiBearerAuth()
  restoreById(@Param('id',ParseIntPipe) id:number) {
    return this.profilesService.restore(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles(user_role.ADMIN)
  @ApiBearerAuth()
  @Serialize(ProfileDto)
  updateProfileById(@Param('id',ParseIntPipe) id:number, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(id, updateProfileDto);
  }
  
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(user_role.ADMIN)
  @ApiBearerAuth()
  removeById(@Param('id' ,ParseIntPipe) id:number) {
    return this.profilesService.remove(id);
  }

}
