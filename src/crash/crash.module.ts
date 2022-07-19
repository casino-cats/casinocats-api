import { Module } from '@nestjs/common';
import { CrashController } from './crash.controller';
import { CrashService } from './crash.service';
import { CrashGateway } from './crash.gateway';

@Module({
  controllers: [CrashController],
  providers: [CrashService, CrashGateway]
})
export class CrashModule {}
