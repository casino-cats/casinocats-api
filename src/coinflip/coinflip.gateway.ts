import { Inject, Logger, CACHE_MANAGER, UseGuards } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import * as crypto from 'crypto';
import { RoundInfoType } from './types';
import { RandomService } from 'src/random/random.service';
import { ROUND_CREATED, ROUND_ENDED, ROUND_STARTED } from './constants';
import { CreateDto, AcceptDto } from './dto';

@WebSocketGateway({ namespace: '/coinflip', cors: 'http://localhost:3000' })
export class CoinflipGateway implements OnGatewayInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private random: RandomService,
  ) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('CoinflipGateway');

  afterInit() {
    this.logger.log('Initialized');
  }

  // @UseGuards(JwtGuard)
  @SubscribeMessage('create')
  async handleCreateRound(client: Socket, dto: CreateDto) {
    let roundId: number = await this.cacheManager.get('coinflipRound');

    // if coinflip round is null set to 1
    if (!roundId) {
      await this.cacheManager.set('coinflipRound', 0, { ttl: 0 });
      roundId = 0;
    }

    // increase the roundId
    await this.cacheManager.set('coinflipRound', ++roundId, { ttl: 0 });

    // get random
    let random8HexList: [string] = await this.cacheManager.get('random8Hex');
    if (!random8HexList || random8HexList[0].length < 1) {
      await this.random.getHexFromRandomOrg();
      random8HexList = await this.cacheManager.get('random8Hex');
    }

    // cache the round info
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
      creatorId: 'test_id_1',
      creatorChosenSide: dto.creatorChosenSide,
      challengerId: null,
    };
    await this.cacheManager.set(`coinflip${roundId}`, roundInfo, { ttl: 0 });

    // emit create round info
    const hash = crypto
      .createHmac('sha256', seed)
      .update(result.toString())
      .digest('hex');

    this.wss.emit(ROUND_CREATED, {
      roundId: roundInfo.roundId,
      betAmount: roundInfo.betAmount,
      creatorChosenSide: roundInfo.creatorChosenSide,
      hash: hash,
    });
  }

  // TODO: useGuard, challengerId, securityToken
  @SubscribeMessage('accept')
  async handleMessage(client: Socket, dto: AcceptDto) {
    const roundInfo: RoundInfoType = await this.cacheManager.get(
      `coinflip${dto.roundId}`,
    );
    // exceptions
    // if (!roundInfo) return;
    // if (roundInfo.locked) return;
    // lock the round and start the round
    // roundInfo.locked = true;
    await this.cacheManager.set(
      `coinflip${dto.roundId}`,
      {
        roundInfo,
      },
      { ttl: 0 },
    );
    roundInfo.challengerId = 'test_id_2';
    // seed implementation
    await this.cacheManager.set(`coinflip${dto.roundId}`, roundInfo, {
      ttl: 0,
    });
    this.wss.emit(ROUND_STARTED, {
      roundId: roundInfo.roundId,
    });
    // emit game result after 3000ms
    setTimeout(() => this.handleRoundResult(roundInfo.roundId), 3000);
  }

  async handleRoundResult(roundId: number) {
    const roundInfo = await this.cacheManager.get(`coinflip${roundId}`);
    this.wss.emit(ROUND_ENDED, roundInfo);
    await this.cacheManager.del(`coinflip${roundId}`);
  }
}
