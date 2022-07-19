import { Global, Module } from '@nestjs/common';
import { RandomService } from './random.service';

@Global()
@Module({
  providers: [RandomService],
  exports: [RandomService],
})
export class RandomModule {}
