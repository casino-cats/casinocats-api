import { Module } from '@nestjs/common';
import { RouletteController } from './roulette.controller';
import { RouletteService } from './roulette.service';
import { RouletteGateway } from './roulette.gateway';

@Module({
  controllers: [RouletteController],
  providers: [RouletteService, RouletteGateway],
})
export class RouletteModule {}
