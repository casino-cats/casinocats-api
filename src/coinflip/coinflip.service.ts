import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import * as crypto from 'crypto';
import { RandomService } from 'src/random/random.service';
import { CoinflipGateway } from './coinflip.gateway';
import { CreateDto } from './dto';
import { RoundInfoType } from './types';

@Injectable()
export class CoinflipService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private random: RandomService,
    private coinflipGateway: CoinflipGateway,
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

    // get random
    let random8HexList: [string] = await this.cacheManager.get('random8Hex');
    if (!random8HexList || random8HexList.length < 1) {
      await this.random.getHexFromRandomOrg();
      random8HexList = await this.cacheManager.get('random8Hex');
    }

    // cache the round infos
    const seed = this.random.getRandomSeed(16);
    const randomHex = _.first(random8HexList);
    await this.cacheManager.set('random8Hex', _.drop(random8HexList), {
      ttl: 0,
    });
    const result = parseInt(randomHex, 16) % 2;
    const roundInfo: RoundInfoType = {
      roundId: roundId,
      locked: false,
      result: result,
      seed: seed,
      betAmount: dto.betAmount,
      creatorId: dto.creatorId,
      creatorChosenSide: dto.creatorChosenSide,
      challengerId: null,
    };

    await this.cacheManager.set(`coinflip${roundId}`, roundInfo, { ttl: 0 });

    const hash = crypto
      .createHmac('sha256', seed)
      .update(result.toString())
      .digest('hex');

    this.coinflipGateway.wss.emit('created', {
      roundId: roundInfo.roundId,
      betAmount: roundInfo.betAmount,
      creatorChoseSided: roundInfo.creatorChosenSide,
      hash: hash,
    });
  }
}
