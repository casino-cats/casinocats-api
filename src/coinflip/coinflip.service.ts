import { Injectable } from '@nestjs/common';
import { RandomService } from 'src/random/random.service';

@Injectable()
export class CoinflipService {
  constructor(private random: RandomService) {}

  create() {
    return this.random.getRandomSeed();
  }
}
