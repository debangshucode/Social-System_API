import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Request, Response } from 'express';
import { ProfilesService } from 'src/profiles/profiles.service';
import { FollowService } from 'src/follow/follow.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class WebCountsInterceptor implements NestInterceptor {
  constructor(
    private readonly profileService: ProfilesService,
    private readonly followService: FollowService,
    private readonly notificationService: NotificationService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    res.locals.reqCount = 0;
    res.locals.nCount = 0;

    const user = (req as any).user;
    if (!user?.sub) return next.handle();

    const profile = await this.profileService.findByUserId(user.sub);
    if (!profile) return next.handle();

    const [reqCount, nCount] = await Promise.all([
      this.followService.countPending(profile.id),
      this.notificationService.countUnread(profile.id),
    ]);

    res.locals.reqCount = reqCount;
    res.locals.nCount = nCount;

    return next.handle();
  }
}
