import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class UtilService {
  getHashFromResultAndSeed(result: number, seed: string): string {
    return crypto
      .createHmac('sha256', seed)
      .update(result.toString())
      .digest('hex');
  }
}
