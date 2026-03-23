import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { Request } from 'express';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { PaginateQuery } from 'nestjs-paginate';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { ProfileDto } from './dto/profile.dto';
@Controller('profiles')
@UseGuards(jwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  // ** role-user
  @Post()
  @ApiBearerAuth()
  @Serialize(ProfileDto)
  create(@Req() req: Request, @Body() createProfileDto: CreateProfileDto) {
    const { user_id } = req.user as { user_id: number };
    return this.profilesService.create(user_id, createProfileDto);
  }

  @Get('/me')
  @ApiBearerAuth()
  @Serialize(ProfileDto)
  findOne(@Req() req: Request) {
    const { user_id } = req.user as { user_id: number };
    return this.profilesService.findOne(user_id);
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
  @Serialize(ProfileDto)
  remove(@Req() req: Request) {
    const { user_id } = req.user as { user_id: number };
    return this.profilesService.remove(user_id);
  }

  // * role admin

  // @Get()
  // findAll() {
  //   return this.profilesService.findAll();
  // }

  // @Post('/create-profile')
  // @UseGuards(jwtAuthGuard)
  // @ApiBearerAuth()
  // createUserProfile(@Req() req: Request, @Body() createProfileDto: CreateProfileDto) {
  //   const { user_id } = req.user as { user_id: number };
  //   return this.profilesService.create(user_id, createProfileDto);
  // }

  // update user profile 
  // get user profile by id 
  // delete profile by id

}
