import { Module } from '@nestjs/common';
import { CoinflipService } from './coinflip.service';
import { CoinflipGateway } from './coinflip.gateway';

@Module({
  providers: [CoinflipService, CoinflipGateway],
})
export class CoinflipModule {}
