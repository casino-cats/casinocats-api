import { Module } from '@nestjs/common';
import { CoinflipController } from './coinflip.controller';
import { CoinflipService } from './coinflip.service';
import { CoinflipGateway } from './coinflip.gateway';

@Module({
  controllers: [CoinflipController],
  providers: [CoinflipService, CoinflipGateway],
})
export class CoinflipModule {}
