import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { RandomService } from 'src/random/random.service';
import { UtilService } from 'src/util/util.service';
import { CrashGateway } from './crash.gateway';
import { ROUND_STARTED } from './helper/constants';
import { calculateRoundTime } from './helper/round';
import { CrashRoundInfo } from './types';
import { CACHE_KEY_CRASH_ROUND_INFO } from './types/cache';

@Injectable()
export class CrashService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private randomService: RandomService,
    private crashGateway: CrashGateway,
    private utilService: UtilService,
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

  // @Interval(5000)
  async handleInterval() {
    let roundInfo: CrashRoundInfo = await this.cacheManager.get(
      CACHE_KEY_CRASH_ROUND_INFO,
    );

    if (!roundInfo) {
      const finalMultiplier =
        this.randomService.getRandomFinalMultiplierForCrash();
      const roundTime = calculateRoundTime(finalMultiplier);
      const seed = this.randomService.getRandomSeed(64);
      const hash = this.utilService.getHashFromResultAndSeed(
        finalMultiplier,
        seed,
      );

      roundInfo = await this.setNewRoundInfoToCache(
        finalMultiplier,
        hash,
        seed,
        roundTime,
      );

      this.crashGateway.wss.emit(ROUND_STARTED, {
        roundId: roundInfo.roundId,
        hash: roundInfo.hash,
      });
    }

    const timeLeft = roundInfo.endTime - Date.now();

    if (timeLeft <= 1000 && timeLeft > 0) {
      setTimeout(() => {
        console.log('game:end');
      }, timeLeft);
    }

    // await this.cacheManager.set('crashRoundInfo', roundInfo, { ttl: 0 });
  }

  // TODO: roundId based on previous roundId from database
  private async setNewRoundInfoToCache(
    finalMultiplier: number,
    hash: string,
    seed: string,
    roundTime: number,
  ): Promise<CrashRoundInfo> {
    const data: CrashRoundInfo = {
      roundId: 1,
      finalMultiplier,
      hash,
      seed,
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
