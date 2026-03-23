import { Controller, Req, UseGuards,Get,Patch,Delete, Body } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Controller('avatar')
@UseGuards(jwtAuthGuard)
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Get('/sign')
  async getSignature(@Req() req){
    return await this.avatarService.generateSignature(req.user.id)
  }

  @Patch('/upload')
  async updateAvatart(@Req() req,@Body() dto:UpdateAvatarDto) {
    return await this.avatarService.updateAvatar(req.user.id,dto.public_id)
  }

  @Delete()
  async deleteAvatar(@Req() req){
    return await this.avatarService.deleteAvatar(req.user.id);
  }

}
