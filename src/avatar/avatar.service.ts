import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { UsersService } from 'src/users/users.service';
import { ProfilesService } from 'src/profiles/profiles.service';


@Injectable()
export class AvatarService {
    constructor(private config: ConfigService, private userService: UsersService, private profileService: ProfilesService) { }

    async generateSignature(userId: number) {
        const timeStamp = Math.round(Date.now() / 1000);

        const folder = `avatars/users/${userId}`;
        const publicId = `avatars/users/${userId}/avatar_${userId}_${Date.now()}`;

        const paramString = `public_id=${publicId}&timestamp=${timeStamp}`;

        const signature = createHash('sha1').update(paramString + this.config.get('CLOUDINARY_API_SECRET')).digest('hex');


        return {
            signature,
            timeStamp,
            public_id: publicId,
            folder,
            api_key: this.config.get('CLOUDINARY_API_KEY'),
            cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
        }
    }

    async updateAvatar(userId: number, publicId: string) {
        // guard 1 - "User 1" can not save "User 2" profile pic as there own"
        const expectedPrefix = `avatars/users/${userId}/avatar_${userId}_`;
        if (!publicId.startsWith(expectedPrefix)) {
            throw new BadRequestException('This image does not belong to your profile');
        }

        // guard 2 "prevents users from giving a cloudinary formated url - which is acctualy not present in the cloudinary database"
        try {
            await cloudinary.api.resource(publicId);
        }
        catch {
            throw new BadRequestException('Image not found in Database please upload it first');
        }

        // delete and replace the old avatar with the new
        const profile = await this.profileService.findByUserId(userId);
        if (!profile) throw new NotFoundException('This user does not have a profile');

        if (profile.cloudinary_public_id && profile.cloudinary_public_id !== publicId) {
            try {
                await cloudinary.uploader.destroy(profile.cloudinary_public_id);
            }
            catch {
                console.error(`[Avatar] Failed to delete old asset: `)
            }
        }

        // construct the url on the backend - do not trust the client to create it , this transformation will runs on cloudinary CDN layer not in our backend 

        const avatarUrl = cloudinary.url(publicId, {
            secure: true,
            transformation: [{
                width: 400,
                height: 400,
                crop: 'fill',
                gravity: 'face',   // smart crop centred on detected face
                fetch_format: 'auto',   // serve WebP to modern browsers automatically
                quality: 'auto',
            }],
        });


        // write to DB
        await this.profileService.updateAvatar(userId, {
            avatar_url: avatarUrl,
            cloudinary_public_id: publicId,
        });

        return { avatar_url: avatarUrl };
    }

    async deleteAvatar(userId: number) {
        const profile = await this.profileService.findByUserId(userId);
        if (!profile) throw new NotFoundException('This user does not have a profile');

        if (!profile.cloudinary_public_id) {
            return { avatar_url: null };
        }

        try {
            await cloudinary.uploader.destroy(profile.cloudinary_public_id);
        }
        catch {
            console.error(`[Avatar] cloudinary delete failed:`);
        }

        await this.profileService.updateAvatar(userId, {
            avatar_url: null,
            cloudinary_public_id: null,
        })

        return { avatar_url: null }
    }
}
