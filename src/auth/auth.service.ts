import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signin() {
    return 'I am in signin';
  }
}
