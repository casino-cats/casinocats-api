import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RandomService {
  getRandomHexString(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  getRandomSeed(): string {
    const random = crypto.randomBytes(64);
    return random
      .toString('base64')
      .replace(/\=/g, '')
      .replace(/\+/g, '')
      .replace(/\//g, '')
      .slice(0, 64);
  }

  getRandomCoinflipResult(): number {
    const randomString = this.getRandomHexString();
    return parseInt(randomString, 16) % 2;
  }
}
