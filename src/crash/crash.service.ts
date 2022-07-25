import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { RandomService } from 'src/random/random.service';
import { UtilService } from 'src/util/util.service';
import { CrashGateway } from './crash.gateway';
import {
  CRASH_BETTING_ENDED,
  CRASH_BETTING_STARTED,
  CRASH_BETTING_TIME,
  CRASH_CACHE_KEY_BET_INFO,
  CRASH_CACHE_KEY_ROUND_STATE,
  CRASH_ENDED,
  CRASH_STARTED,
} from './helper/constants';
import { getTimeFromMultiplier } from './helper/round';
import { CrashBetInfo, CrashRoundInfo, CRASH_ROUND_STATES } from './types';
import { CRASH_CACHE_KEY_ROUND_INFO } from './helper/constants';

@Injectable()
export class CrashService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private randomService: RandomService,
    private crashGateway: CrashGateway,
    private utilService: UtilService,
  ) {}

  async onModuleInit() {
    await this.cacheManager.set(
      CRASH_CACHE_KEY_ROUND_STATE,
      CRASH_ROUND_STATES.PREPARATION,
      { ttl: 0 },
    );

    await this.cacheManager.set(CRASH_CACHE_KEY_ROUND_INFO, 0, { ttl: 0 });

    // await this.cacheManager.set(CRASH_CACHE_KEY_BET_INFO, null, {
    //   ttl: 0,
    // });
  }

  async getCurrentGame() {
    return this.randomService.getRandomFinalMultiplierForCrash();
  }

  async placeBet() {
    return 'placeBet';
  }

  async cashOut() {
    return 'cashOut';
  }

  @Interval(1000)
  async handleInterval() {
    const roundState = await this.cacheManager.get<string>(
      CRASH_CACHE_KEY_ROUND_STATE,
    );
    let roundInfo = await this.cacheManager.get<CrashRoundInfo>(
      CRASH_CACHE_KEY_ROUND_INFO,
    );
    const betInfo = await this.cacheManager.get<CrashBetInfo>(
      CRASH_CACHE_KEY_BET_INFO,
    );

    // preparation state
    if (
      roundState == CRASH_ROUND_STATES.PREPARATION &&
      roundInfo.finalMultiplier == null
    ) {
      const finalMultiplier =
        this.randomService.getRandomFinalMultiplierForCrash();
      const seed = this.randomService.getRandomSeed(64);
      const hash = this.utilService.getHashFromResultAndSeed(
        finalMultiplier,
        seed,
      );

      roundInfo = await this.setNewRoundInfoToCache(
        finalMultiplier,
        hash,
        seed,
      );

      await this.cacheManager.set(
        CRASH_CACHE_KEY_ROUND_STATE,
        CRASH_ROUND_STATES.BETTING,
        { ttl: 0 },
      );

      await this.cacheManager.set<CrashBetInfo>(
        CRASH_CACHE_KEY_BET_INFO,
        {
          roundId: roundInfo.roundId,
          emit: false,
          bettingStarted: Date.now(),
          bettingList: [],
        },
        { ttl: 0 },
      );

      return;
    }

    // betting state
    if (roundState == CRASH_ROUND_STATES.BETTING) {
      if (!betInfo.emit) {
        betInfo.emit = true;
        await this.cacheManager.set(CRASH_CACHE_KEY_BET_INFO, betInfo, {
          ttl: 0,
        });

        this.crashGateway.wss.emit(CRASH_BETTING_STARTED, {
          roundId: roundInfo.roundId,
          hash: roundInfo.hash,
        });
      }

      const timePassed = Date.now() - betInfo.bettingStarted;

      if (timePassed > CRASH_BETTING_TIME) {
        await this.cacheManager.set(
          CRASH_CACHE_KEY_ROUND_STATE,
          CRASH_ROUND_STATES.CRASH,
          { ttl: 0 },
        );

        this.crashGateway.wss.emit(CRASH_BETTING_ENDED, {
          roundId: roundInfo.roundId,
        });
      }

      return;
    }

    // crash

    if (!roundInfo.startTime) {
      const roundTime = getTimeFromMultiplier(roundInfo.finalMultiplier);
      console.log(roundInfo.finalMultiplier);
      console.log(roundTime);
      roundInfo.startTime = Date.now();
      roundInfo.endTime = Date.now() + roundTime;

      await this.cacheManager.set<CrashRoundInfo>(
        CRASH_CACHE_KEY_ROUND_INFO,
        roundInfo,
        { ttl: 0 },
      );

      this.crashGateway.wss.emit(CRASH_STARTED, { roundId: roundInfo.roundId });
    }

    const timeLeft = roundInfo.endTime - Date.now();

    if (timeLeft <= 1000 && timeLeft > 0) {
      setTimeout(() => {
        this.handleRoundEnded();
      }, timeLeft);
    }
  }

  private async handleRoundEnded() {
    const roundInfo = await this.cacheManager.get<CrashRoundInfo>(
      CRASH_CACHE_KEY_ROUND_INFO,
    );

    await this.cacheManager.set(
      CRASH_CACHE_KEY_ROUND_STATE,
      CRASH_ROUND_STATES.PREPARATION,
      { ttl: 0 },
    );

    roundInfo.endTime = null;
    roundInfo.finalMultiplier = null;
    roundInfo.hash = null;
    ++roundInfo.roundId;
    roundInfo.startTime = null;

    await this.cacheManager.set(CRASH_CACHE_KEY_ROUND_INFO, roundInfo, {
      ttl: 0,
    });

    this.crashGateway.wss.emit(CRASH_ENDED, {
      roundId: roundInfo.roundId,
      roundResult: roundInfo.finalMultiplier,
      seed: roundInfo.seed,
    });
  }

  // TODO: roundId based on previous roundId from database
  private async setNewRoundInfoToCache(
    finalMultiplier: number,
    hash: string,
    seed: string,
  ): Promise<CrashRoundInfo> {
    const data: CrashRoundInfo = {
      roundId: 1,
      finalMultiplier,
      hash,
      seed,
      startTime: null,
      endTime: null,
    };

    await this.cacheManager.set<CrashRoundInfo>(
      CRASH_CACHE_KEY_ROUND_INFO,
      data,
      { ttl: 0 },
    );

    return data;
  }
}
