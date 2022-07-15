import { Inject, Logger, CACHE_MANAGER } from '@nestjs/common';
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
import { MSG_TO_CLIENT } from './constants';
import { RandomService } from 'src/random/random.service';
import { CreateDto } from './dto';

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

  @SubscribeMessage('create')
  async handleCreateRound(client: Socket, payload: CreateDto) {
    console.log(payload);
    let roundId: number = await this.cacheManager.get('coinflipRound');

    // if coinflip round is null set to 1
    if (!roundId) {
      await this.cacheManager.set('coinflipRound', 0, { ttl: 0 });
      roundId = 1;
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
      betAmount: payload.betAmount,
      creatorId: 'test_id_1',
      creatorChosenSide: payload.creatorChosenSide,
      challengerId: null,
    };
    await this.cacheManager.set(`coinflip${roundId}`, roundInfo, { ttl: 0 });

    // emit create round info
    const hash = crypto
      .createHmac('sha256', seed)
      .update(result.toString())
      .digest('hex');

    this.wss.emit('created', {
      roundId: roundInfo.roundId,
      betAmount: roundInfo.betAmount,
      creatorChosenSide: roundInfo.creatorChosenSide,
      hash: hash,
    });
  }

  // TODO: useGuard, challengerId, securityToken
  @SubscribeMessage('accept')
  async handleMessage(
    client: Socket,
    payload: { roundId: number; securityToken: string },
  ) {
    const roundInfo: RoundInfoType = await this.cacheManager.get(
      `coinflip${payload.roundId}`,
    );
    // exceptions
    // if (!roundInfo) return;
    // if (roundInfo.locked) return;
    // lock the round and start the round
    roundInfo.locked = true;
    await this.cacheManager.set(
      `coinflip${payload.roundId}`,
      {
        roundInfo,
      },
      { ttl: 0 },
    );
    roundInfo.challengerId = '123';
    // seed implementation
    await this.cacheManager.set(
      `coinflip${payload.roundId}`,
      {
        roundInfo,
      },
      { ttl: 0 },
    );
    this.wss.emit(MSG_TO_CLIENT, roundInfo);
    // emit game result after three seconds later
    setTimeout(() => this.handleRoundResult(payload.roundId), 3000);
  }

  handleRoundResult(roundId: number) {
    this.wss.emit(MSG_TO_CLIENT, `roundInfo${roundId}`);
  }
}
