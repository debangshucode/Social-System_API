import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Like, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProfilesService {
  constructor(@InjectRepository(Profile) private profileRepo: Repository<Profile>, private userService: UsersService) { }
  async create(id: number, createProfileDto: CreateProfileDto) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User not found !');
    const isProfile = await this.profileRepo.findOne({ where: { user: { id } } });
    if (isProfile) throw new BadRequestException('Profile Already Existes');

    const profile = this.profileRepo.create({ ...createProfileDto, user });
    return this.profileRepo.save(profile)
  }

  findAll(query: PaginateQuery) {
    return paginate(query, this.profileRepo, {
      relations: ['user'],
      sortableColumns: ['id', 'created_at'],
      searchableColumns: ['user_name'],
      defaultSortBy: [['id', 'DESC']],
      defaultLimit:5
    })
  }

  async findOne(id: number) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User not found !');
    const Profile = await this.profileRepo.findOne({ where: { user: { id } }, relations: { user: true } });
    if (!Profile) throw new NotFoundException('Profile Not Existes !');
    return Profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User not found !');
    const Profile = await this.profileRepo.findOne({ where: { user: { id } } });
    if (!Profile) throw new NotFoundException('Profile Not Existes !');

    Object.assign(Profile, updateProfileDto)

    return await this.profileRepo.save(Profile)
  }

  async remove(id: number) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User not found !');
    const Profile = await this.profileRepo.findOne({ where: { user: { id } } });
    if (!Profile) throw new NotFoundException('Profile Not Existes !');

    await this.profileRepo.softDelete(Profile.id)

    return { message: 'Profile deleted succesfully' };
  }

  async restore(id: number) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User not found !');
    const Profile = await this.profileRepo.findOne({ where: { user: { id } }, withDeleted: true });
    if (!Profile) throw new NotFoundException('Profile Not Existes !');

    await this.profileRepo.restore(Profile.id)

    if (Profile.deleted_at !== null) {
      return { message: `Succesfully restored - ${Profile.user_name}` };
    }
    else {
      return { message: `Profile is not deleted` };
    }
  }

  async findByUserId(id: number) {
    const profile = await this.profileRepo.findOne({
      where: { user: { id } },
      relations: { user: true }
    });
    return profile;
  }


  async findByUserName(userName: string, query: PaginateQuery) {
    return paginate(query, this.profileRepo, {
      where: { user_name: Like(`%${userName}%`) },
      relations: ['user'],
      sortableColumns: ['id', 'created_at'],
      defaultSortBy: [['id', 'DESC']],
      defaultLimit:3
    });
  }

  async findByProfileId(id:number){
    return this.profileRepo.findOne({where:{id}});
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
