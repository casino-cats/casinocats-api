import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RandomService } from 'src/random/random.service';
import { CreateDto } from './dto';

@Injectable()
export class CoinflipService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private random: RandomService,
  ) {}

  // TODO: if coinflip round is not set
  // TODO: balance
  async create(dto: CreateDto) {
    let round: number = await this.cacheManager.get('coinflipRound');

    // if coinflip round is null set to 1
    if (!round) {
      await this.cacheManager.set('coinflipRound', 0, { ttl: 0 });
      round = 1;
    }
    // increase
    await this.cacheManager.set('coinflipRound', ++round, { ttl: 0 });

    // cache the round infos
    const roundInfo = {
      round: round,
      result: null,
      serverSeed: null,
      creatorSeed: null,
      challengerSeed: null,
      betAmount: dto.betAmount,
      creatorId: dto.creatorId,
      creatorChosenSide: dto.creatorChosenSide,
      challengerId: null,
      challengerChosenSide: null,
    };

    await this.cacheManager.set(`coinflip{$round}`, roundInfo, { ttl: 0 });

    const temp = await this.cacheManager.get(`coinflip{$round}`);

    return { temp };
  }
}
