import { Module } from '@nestjs/common';
import { CoinflipGateway } from './coinflip.gateway';
import { CoinflipController } from './coinflip.controller';
import { CoinflipService } from './coinflip.service';

@Module({
  controllers: [CoinflipController],
  providers: [CoinflipService, CoinflipGateway],
})
export class CoinflipModule {}
