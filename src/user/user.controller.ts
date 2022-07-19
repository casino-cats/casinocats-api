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
}
