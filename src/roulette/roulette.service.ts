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

  // @Interval(1000)
  async handleInterval() {
    let count: number = await this.cacheManager.get('count');

    // stop betting
    if (count == 8) {
      const round: number = await this.cacheManager.get('round');
      const rouletteResult = await this.cacheManager.get('rouletteResult');
      this.rouletteGateway.wss.emit('messageToClient', [
        'roll',
        { round: round, result: rouletteResult },
      ]);
      await this.cacheManager.set('count', ++count, { ttl: 0 });
      return;
    }

    // end round
    if (count == 10) {
      const seed = await this.cacheManager.get('seed');
      let round: number = await this.cacheManager.get('round');
      this.rouletteGateway.wss.emit('messageToClient', [
        'end',
        { round: round, seed: seed },
      ]);

      await this.cacheManager.set('round', ++round, { ttl: 0 });
      await this.cacheManager.set('count', 0, { ttl: 0 });
      return;
    }

    // start round
    if (count == 0) {
      const round: number = await this.cacheManager.get('round');
      const seed = this.getSeed();
      const rouletteResult = this.getRandomResult();
      console.log({ rouletteResult });
      const hash = crypto
        .createHmac('sha256', seed)
        .update(rouletteResult)
        .digest('hex');

      await this.cacheManager.set('seed', seed, { ttl: 0 });
      await this.cacheManager.set('rouletteResult', rouletteResult, { ttl: 0 });
      this.rouletteGateway.wss.emit('messageToClient', [
        'start',
        { round: round, hash: hash },
      ]);
      await this.cacheManager.set('count', ++count, { ttl: 0 });
      return;
    }

    await this.cacheManager.set('count', ++count, { ttl: 0 });
  }
}
