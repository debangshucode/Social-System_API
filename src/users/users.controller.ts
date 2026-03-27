import { Controller, Get, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe, NotFoundException, Render } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Request } from 'express';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { changePasswordDto } from './dto/change-password.dto';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate'
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { user_role } from './entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // * User -- Change Password
  @Patch('/me/password')
  @UseGuards(jwtAuthGuard)
  @ApiOperation({ summary: 'Change the current user password' })
  @ApiBearerAuth()
  @ApiBody({ type: changePasswordDto })
  @ApiOkResponse({ schema: { example: { message: 'Password changed successfully' } } })
  async changePassword(@Req() req: Request, @Body() changePassDto: changePasswordDto) {
    const { user_id } = req.user as { user_id: number };
    await this.usersService.changePass(user_id, changePassDto.cur_password, changePassDto.new_password);
    return { message: 'Password changed successfully' };
  }

  // * User -- Update name and phone number
  @Patch('/me/edit')
  @Serialize(UserDto)
  @UseGuards(jwtAuthGuard)
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserDto })
  async editUser(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const { user_id } = req.user as { user_id: number };
    const updatedUser = await this.usersService.update(user_id, updateUserDto)
    return updatedUser;
  }

  @Get('/me')
  // @Serialize(UserDto)
  @UseGuards(jwtAuthGuard)
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserDto })
  @Render('users/list')
  async getCurUser(@Req() req: Request) {
    const { user_id } = req.user as { user_id: number };
    const user = await this.usersService.findOne(user_id);
    if (!user) throw new NotFoundException('User not found !');
    return {user,title:user.first_name+" "+user.last_name.split('')[0]};
  }

  //^ ===== ADMIN  Routes ====

  // ~ Admin  - get all users 
  @Get()
  @UseGuards(jwtAuthGuard, RoleGuard)
  @Roles(user_role.ADMIN)
  @ApiOperation({ summary: 'Get all users as admin' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(@Paginate() query: PaginateQuery) {
    const result = await this.usersService.findAll(query);

    return {
      ...result,
      data: plainToInstance(UserDto, result.data, {
        excludeExtraneousValues: true,
      })
    }
  }

  // ~ Admin - get one user by id
  @Get(':id')
  @Serialize(UserDto)
  @UseGuards(jwtAuthGuard, RoleGuard)
  @Roles(user_role.ADMIN)
  @ApiOperation({ summary: 'Get a user by id as admin' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: UserDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOne(id);
  }

  // ~ Admin - update user 
  @Patch(':id')
  @Serialize(UserDto)
  @UseGuards(jwtAuthGuard, RoleGuard)
  @Roles(user_role.ADMIN)
  @ApiOperation({ summary: 'Update a user by id as admin' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto)
  }

  // ~ Admin - Deactivate user
  // @Delete(':id')
  // @UseGuards(jwtAuthGuard, RoleGuard)
  // @Roles(user_role.ADMIN)
  // remove(@Param('id',ParseIntPipe) id: number) {
  //   return this.usersService.remove(id);
  // }
  // ! currently no delete for user entity

}
