import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { paginate } from 'nestjs-paginate'
import type { PaginateQuery } from 'nestjs-paginate'
import { RegisterDto } from 'src/auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) { }

  async create(createUser: RegisterDto) {
    const user = this.userRepo.create(createUser);
    try {
      return await this.userRepo.save(user)
    }
    catch (err) {
      if (err instanceof QueryFailedError && err.driverError.code === '23505') {
        throw new ConflictException('User already exist')
      }
      else {
        throw err;
      }
    }
  }

  findAll(query: PaginateQuery) {
    return paginate(query, this.userRepo, {
      sortableColumns: ['id', 'first_name'],
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['email', 'first_name', 'phone_number'],
    })
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('User not found !');
    return user;
  }

  async findByMail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    return user;
  }

  async changePass(id: number, curPass: string, newPass: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const passMatch = await bcrypt.compare(curPass, user.password);
    if (!passMatch) throw new UnauthorizedException("Invalid credentials");
    user.password = await bcrypt.hash(newPass, 12);
    user.refreshToken = null;
    return this.userRepo.save(user)
  }

  async updateRefreshToken(userID: number, token: string | null) {
    await this.userRepo.update(userID, { refreshToken: token });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updates = Object.fromEntries(
      Object.entries(updateUserDto).filter(([_, value]) => value !== undefined && value !== null)
    );

    Object.assign(user,updates)

    return await this.userRepo.save(user)
  }
}
