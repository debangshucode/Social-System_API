import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfilesService {
  constructor(@InjectRepository(Profile) private profileRepo: Repository<Profile>, private userService: UsersService) { }
  async create(id: number, createProfileDto: CreateProfileDto) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User not found !');
    const isProfile = await this.profileRepo.findOne({where:{user:{id}}});
    if(isProfile) throw new BadRequestException('Profile Already Existes');

    const profile = this.profileRepo.create({...createProfileDto,user}); 
    return this.profileRepo.save(profile)
  }

  findAll() {
    return `This action returns all profiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }

  async findByUserId(id: number) {
    const profile = await this.profileRepo.findOne({
      where: { user: { id } },
      select: ['id', 'cloudinary_public_id'],
    });
    return profile;
  }

  async updateAvatar(
    id: number,
    data: {
      avatar_url: string | null;
      cloudinary_public_id: string | null;
    }
  ) {
    await this.profileRepo.update(
      { user: { id } },
      {
        avatar_url: data.avatar_url,
        cloudinary_public_id: data.cloudinary_public_id,
      }
    );

    return { avatar_url: data.avatar_url };
  }
}
