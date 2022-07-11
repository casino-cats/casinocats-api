import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SolanaModule } from './solana/solana.module';
import { RouletteModule } from './roulette/roulette.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RouletteGateway } from './roulette/roulette.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    SolanaModule,
    RouletteModule,
  ],
  providers: [RouletteGateway],
})
export class AppModule {}
