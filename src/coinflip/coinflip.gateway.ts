import { Inject, Logger, CACHE_MANAGER } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Cache } from 'cache-manager';
import { RoundInfoType } from './types';
import { MSG_TO_CLIENT } from './constants';

@WebSocketGateway({ namespace: '/coinflip', cors: 'http://localhost:3000' })
export class CoinflipGateway implements OnGatewayInit {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('CoinflipGateway');

  afterInit() {
    this.logger.log('Initialized');
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
    await this.cacheManager.set(`coinflip${payload.roundId}`, {
      roundInfo,
    });
    roundInfo.challengerId = '123';
    roundInfo.challengerSeed = payload.securityToken;
    // seed implementation
    await this.cacheManager.set(`coinflip${payload.roundId}`, {
      roundInfo,
    });

    this.wss.emit(MSG_TO_CLIENT, roundInfo);
  }
}
