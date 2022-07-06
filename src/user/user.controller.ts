import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guard';

@Controller('user')
export class UserController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }
  // this is redis cache test
  @Get('get-string-cache')
  async getSimpleString() {
    const value = await this.cacheManager.get('my-string');
    let valueCount: number = await this.cacheManager.get('my-string-count');

    if (value && valueCount) {
      await this.cacheManager.set('my-string-count', ++valueCount);
      console.log({
        data: { value, valueCount },
        loadsFrom: 'redis cache',
      });
      return {
        data: { value, valueCount },
        loadsFrom: 'redis cache',
      };
    }

    await this.cacheManager.set('my-string', 'my name is simon', { ttl: 300 });
    await this.cacheManager.set('my-string-count', 1, { ttl: 300 });
    console.log(await this.cacheManager.get('my-string-count'));

    return {
      data: 'my name is simon',
      loadsFrom: 'fake database',
    };
  }
}
