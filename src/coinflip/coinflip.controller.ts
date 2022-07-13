import { Body, Controller, Post } from '@nestjs/common';
import { CoinflipService } from './coinflip.service';
import { CreateDto } from './dto';

@Controller('coinflip')
export class CoinflipController {
  constructor(private coinflipService: CoinflipService) {}
  @Post('create')
  create(@Body() dto: CreateDto) {
    return this.coinflipService.create(dto);
  }
}
