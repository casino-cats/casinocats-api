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
    if (value) {
      return {
        data: value,
        loadsFrom: 'redis cache',
      };
    }
    await this.cacheManager.set('my-string', 'my name is simon', { ttl: 300 });

    return {
      data: 'my name is simon',
      loadsFrom: 'fake database',
    };
  }
}
