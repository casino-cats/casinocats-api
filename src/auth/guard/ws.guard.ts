import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const bearerToken = context
      .getArgByIndex(0)
      .handshake.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(bearerToken, this.config.get('JWT_SECRET'));
      if (decoded) return true;
      return false;
    } catch (error) {
      // throw new WsException('Invalid Credentials');
      console.log(context.getArgByIndex(0));
      // return false;
    }
  }
}
