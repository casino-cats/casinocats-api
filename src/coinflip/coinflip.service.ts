import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RandomService } from 'src/random/random.service';
import { CreateDto } from './dto';

export type AcceptType = {
  roundId: number;
  challengerId: string;
  securityToken: string;
};

type RoundInfoType = {
  roundId: number;
  locked: boolean;
  result: number;
  serverSeed: string;
  creatorSeed: string;
  challengerSeed: string;
  betAmount: number;
  creatorId: string;
  creatorChosenSide: number;
  challengerId: string;
};

@Injectable()
export class CoinflipService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private random: RandomService,
  ) {}

  // TODO: if coinflip round is not set
  // TODO: balance
  async create(dto: CreateDto) {
    let roundId: number = await this.cacheManager.get('coinflipRound');

    // if coinflip round is null set to 1
    if (!roundId) {
      await this.cacheManager.set('coinflipRound', 0, { ttl: 0 });
      roundId = 1;
    }
    // increase
    await this.cacheManager.set('coinflipRound', ++roundId, { ttl: 0 });

    // cache the round infos
    const roundInfo: RoundInfoType = {
      roundId: roundId,
      locked: false,
      result: null,
      serverSeed: null,
      creatorSeed: null,
      challengerSeed: null,
      betAmount: dto.betAmount,
      creatorId: dto.creatorId,
      creatorChosenSide: dto.creatorChosenSide,
      challengerId: null,
    };

    await this.cacheManager.set(`coinflip${roundId}`, roundInfo, { ttl: 0 });

    console.log(`coinflip${roundId}`);

    const temp = await this.cacheManager.get(`coinflip${roundId}`);

    return { temp };
  }
}
