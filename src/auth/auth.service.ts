import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { sign } from 'tweetnacl';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signin(dto: AuthDto) {
    console.log({ dto });
    // signed message validation
    const validationMessage = 'Welcome to casinocats';
    const encodedMessage = new TextEncoder().encode(validationMessage);

    const result = sign.detached.verify(
      encodedMessage,
      Uint8Array.from(dto.signature.data),
      Uint8Array.from(dto.publicKey.data),
    );

    if (!result) throw new ForbiddenException('Credentials incorrect');

    console.log(result);

    return { result: 'I am in signin' };
  }
}
