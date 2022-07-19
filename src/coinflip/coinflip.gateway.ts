import { Inject, CACHE_MANAGER, UseGuards } from '@nestjs/common';
import {
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
import { WsGuard } from 'src/auth/guard/ws.guard';

@WebSocketGateway({ namespace: '/coinflip', cors: 'http://localhost:3000' })
export class CoinflipGateway {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private random: RandomService,
  ) {}

  @WebSocketServer() wss: Server;

  // @UseGuards(WsGuard)
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

    // cache the round info
    const roundInfo: RoundInfoType = {
      roundId: roundId,
      locked: false,
      result: null,
      betAmount: dto.betAmount,
      creatorId: 'test_id_1',
      creatorChosenSide: dto.creatorChosenSide,
      challengerId: null,
    };
    await this.cacheManager.set(`coinflip${roundId}`, roundInfo, { ttl: 0 });

    // emit create round info
    this.wss.emit(ROUND_CREATED, {
      roundId: roundInfo.roundId,
      betAmount: roundInfo.betAmount,
      creatorChosenSide: roundInfo.creatorChosenSide,
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
    const randomHex = await this.random.getHexFromRandomOrg();
    const result = parseInt(randomHex, 16) % 2;
    roundInfo.result = result;
    await this.cacheManager.set(`coinflip${dto.roundId}`, roundInfo, {
      ttl: 0,
    });
  }

  async handleRoundResult(roundId: number) {
    const roundInfo = await this.cacheManager.get(`coinflip${roundId}`);
    this.wss.emit(ROUND_ENDED, roundInfo);
    await this.cacheManager.del(`coinflip${roundId}`);
  }
}
