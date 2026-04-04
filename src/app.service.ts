import { Injectable, Logger } from '@nestjs/common';
import {Cron , CronExpression} from '@nestjs/schedule';


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron() {
    Logger.log('Running a task every 10 seconds');
  }
}
