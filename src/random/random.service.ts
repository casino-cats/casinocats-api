import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RandomService {
  getRandomSeed(): string {
    const random = crypto.randomBytes(64);
    return random
      .toString('base64')
      .replace(/\=/g, '')
      .replace(/\+/g, '')
      .replace(/\//g, '')
      .slice(0, 64);
  }
}
