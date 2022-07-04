import { Global, Module } from '@nestjs/common';
import { SolanaService } from './solana.service';

@Global()
@Module({
  providers: [SolanaService],
  exports: [SolanaService],
})
export class SolanaModule {}
