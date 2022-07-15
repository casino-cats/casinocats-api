import { Injectable } from '@nestjs/common';
import * as axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class RandomService {
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

  async getHexFromRandomOrg() {
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
            n: 8,
            length: 10,
            characters: '0123456789ABCDEF',
            replacement: true,
          },
          id: 42,
        }),
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          // Use client.receive when you received a JSON-RPC response.
          // this.client.receive(response.data);
        }
      });
  }
}
