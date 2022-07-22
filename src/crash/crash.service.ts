import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { RandomService } from 'src/random/random.service';
import { calculateRoundTime } from './helper/round';
import { CrashRoundInfo } from './types';
import { CACHE_KEY_CRASH_ROUND_INFO } from './types/cache';

@Injectable()
export class CrashService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private randomService: RandomService,
  ) {}

  async getCurrentGame() {
    return this.randomService.getRandomFinalMultiplierForCrash();
  }

  async placeBet() {
    return 'placeBet';
  }

  async cashOut() {
    return 'cashOut';
  }

  // @Interval(1000)
  async handleInterval() {
    let roundInfo: CrashRoundInfo = await this.cacheManager.get(
      CACHE_KEY_CRASH_ROUND_INFO,
    );

    if (!roundInfo) {
      const finalMultiplier =
        this.randomService.getRandomFinalMultiplierForCrash();
      const roundTime = calculateRoundTime(finalMultiplier);

      roundInfo = await this.setNewRoundInfoToCache(finalMultiplier, roundTime);

      console.log('game:started');
    }

    const timeLeft = roundInfo.endTime - Date.now();

    if (timeLeft <= 1000 && timeLeft > 0) {
      setTimeout(() => {
        console.log('game:end');
      }, timeLeft);
    }

    // await this.cacheManager.set('crashRoundInfo', roundInfo, { ttl: 0 });
  }

  private async setNewRoundInfoToCache(
    finalMultiplier: number,
    roundTime: number,
  ): Promise<CrashRoundInfo> {
    const data = {
      finalMultiplier,
      startTime: Date.now(),
      endTime: Date.now() + roundTime,
    };

    await this.cacheManager.set<CrashRoundInfo>(
      CACHE_KEY_CRASH_ROUND_INFO,
      data,
      { ttl: 0 },
    );

    return data;
  }
}
