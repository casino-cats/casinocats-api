import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Interval(1000)
  async handleInterval() {
    const value = await this.cacheManager.get('my-string');
    let valueCount: number = await this.cacheManager.get('my-string-count');

    if (value && valueCount) {
      await this.cacheManager.set('my-string-count', ++valueCount);
      console.log({
        data: { value, valueCount },
        loadsFrom: 'redis cache',
      });
      return {
        data: { value, valueCount },
        loadsFrom: 'redis cache',
      };
    }

    await this.cacheManager.set('my-string', 'my name is simon', { ttl: 0 });
    await this.cacheManager.set('my-string-count', 1, { ttl: 0 });
    console.log(await this.cacheManager.get('my-string-count'));

    return {
      data: 'my name is simon',
      loadsFrom: 'fake database',
    };
  }
}
