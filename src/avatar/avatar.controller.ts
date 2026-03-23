import { Controller, Req, UseGuards, Get, Patch, Delete, Body } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { jwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('avatar')
@UseGuards(jwtAuthGuard)
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) { }

  @ApiOperation({ summary: 'Get the signed token ' })
  @ApiBearerAuth()
  @Get('/sign')
  async getSignature(@Req() req: Request) {
    const { user_id } = req.user as { user_id: number };
    return await this.avatarService.generateSignature(user_id)
  }

  @Patch('/upload')
  async updateAvatart(@Req() req: Request, @Body() dto: UpdateAvatarDto) {
    const { user_id } = req.user as { user_id: number };
    return await this.avatarService.updateAvatar(user_id, dto.public_id)
  }

  @Delete()
  async deleteAvatar(@Req() req: Request) {
    const { user_id } = req.user as { user_id: number };
    return await this.avatarService.deleteAvatar(user_id);
  }

}
