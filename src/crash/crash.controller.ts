import { Controller, Get, Post } from '@nestjs/common';
import { CrashService } from './crash.service';

@Controller('crash')
export class CrashController {
  constructor(private crashService: CrashService) {}

  @Get()
  getCurrentGame() {
    return this.crashService.getCurrentGame();
  }

  @Post()
  placeBet() {
    return this.crashService.placeBet();
  }

  @Post()
  cashOut() {
    return this.crashService.cashOut();
  }
}
