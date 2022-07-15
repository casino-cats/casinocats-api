import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class RandomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

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

  // TODO: exception
  getHexFromRandomOrg() {
    axios
      .default({
        method: 'post',
        url: 'https://api.random.org/json-rpc/4/invoke',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
          jsonrpc: '2.0',
          method: 'generateSignedStrings',
          params: {
            apiKey: 'ddb976ee-f90a-416d-997e-82f1384cf34d',
            n: 10,
            length: 8,
            characters: '0123456789abcdef',
            replacement: true,
          },
          id: 42,
        }),
      })
      .then(async (response) => {
        if (response.status === 200) {
          await this.cacheManager.set(
            'random8Hex',
            response.data.result.random.data,
            {
              ttl: 0,
            },
          );
        }
      });
  }
}
