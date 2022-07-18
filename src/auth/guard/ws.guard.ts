import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
      console.log(decoded);
      if (decoded) return true;
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
