import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { RouletteGateway } from './roulette.gateway';

@Injectable()
export class RouletteService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private rouletteGateway: RouletteGateway,
  ) {}

  getRandomResult(): string {
    const random = crypto.randomBytes(8);
    return (parseInt(random.toString('hex'), 16) % 3).toString();
  }

  getSeed(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  @Interval(1000)
  async handleInterval() {
    let count: number = await this.cacheManager.get('count');

    if (count) {
      await this.cacheManager.set('count', ++count);
      this.rouletteGateway.wss.emit('messageToClient', {
        count,
      });
      return;
    }

    const seed = this.getSeed();
    const rouletteResult = this.getRandomResult();

    console.log({ seed });
    const hash = crypto
      .createHmac('sha256', seed)
      .update(rouletteResult)
      .digest('hex');

    console.log(hash);

    await this.cacheManager.set('seed', seed);
    await this.cacheManager.set('rouletteResult', rouletteResult);

    this.rouletteGateway.wss.emit('messageToClient', { hash });
  }
}
