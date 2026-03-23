import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
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
