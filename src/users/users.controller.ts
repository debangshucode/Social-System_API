import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Request } from 'express';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { changePasswordDto } from './dto/change-password.dto';
import { Paginate } from 'nestjs-paginate';
import type {PaginateQuery} from 'nestjs-paginate'
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // * User -- Change Password
  @Patch('/me/password')
  @UseGuards(jwtAuthGuard)
  async changePassword(@Req() req: Request, @Body() changePassDto: changePasswordDto) {
    const { user_id } = req.user as { user_id: number };
    await this.usersService.changePass(user_id, changePassDto.cur_password, changePassDto.new_password);
    return {message:'Password changed successfully'};
  }

  // * User -- Update name and phone number
  @Patch('/me/edit')
  @UseGuards(jwtAuthGuard)
  async editUser(@Req() req: Request,@Body() updateUserDto: UpdateUserDto){
    const {user_id} = req.user as {user_id:number};
    const updatedUser = await this.usersService.update(user_id,updateUserDto)
    return updatedUser;
  }

  @Get('/me') 
  @UseGuards(jwtAuthGuard)
  async getCurUser(@Req() req:Request) {
    const {user_id} = req.user as{user_id:number};
    return this.usersService.findOne(user_id);
  }

  //^ ===== ADMIN  Routes ====

  // ~ Admin  - get all users 
  @Get()
  findAll(@Paginate() query:PaginateQuery) {
    return this.usersService.findAll(query);
  }

  // ~ Admin - get one user by id
  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // ~ Admin - update user 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  }

  // ~ Admin - Deactivate user
  @Delete(':id')
  remove(@Param('id') id: string) {
  }

  
}
