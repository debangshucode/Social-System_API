import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfilesService {
  constructor(private profileRepo: Repository<Profile>) { }
  create(createProfileDto: CreateProfileDto) {
    return 'This action adds a new profile';
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
  )
  {
    await this.profileRepo.update(
      {user:{id}},
      {
        avatar_url:data.avatar_url,
        cloudinary_public_id:data.cloudinary_public_id,
      }
    );

    return {avatar_url:data.avatar_url};
  }
}
