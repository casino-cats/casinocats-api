import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as axios from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RandomService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  getRandomHexString(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  getRandomSeed(length: number): string {
    const random = crypto.randomBytes(64);
    return random
      .toString('base64')
      .replace(/\=/g, '')
      .replace(/\+/g, '')
      .replace(/\//g, '')
      .slice(0, length);
  }

  getRandomCoinflipResult(): number {
    const randomString = this.getRandomHexString();
    return parseInt(randomString, 16) % 2;
  }

  getRandomFinalMultiplierForCrash(): number {
    return this.random_bm(1, 100, 8);
  }

  private random_bm(min, max, skew) {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5;
    if (num > 1 || num < 0) num = this.random_bm(min, max, skew);
    else {
      num = Math.pow(num, skew);
      num *= max - min;
      num += min;
    }
    return num;
  }

  // TODO: exception, error
  getHexFromRandomOrg(): Promise<string> {
    return axios
      .default({
        method: 'post',
        url: 'https://api.random.org/json-rpc/4/invoke',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
          jsonrpc: '2.0',
          method: 'generateSignedStrings',
          params: {
            apiKey: this.configService.get('RANDOM_API_KEY'),
            n: 1,
            length: 8,
            characters: '0123456789abcdef',
            replacement: true,
          },
          id: 42,
        }),
      })
      .then(async (response) => {
        if (response.status === 200) {
          return response.data.result.random.data[0];
        } else {
          return 'error';
        }
      });
  }
}
