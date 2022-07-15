import { Controller } from '@nestjs/common';
import { CoinflipService } from './coinflip.service';

@Controller('coinflip')
export class CoinflipController {
  constructor(private coinflipService: CoinflipService) {}
}
