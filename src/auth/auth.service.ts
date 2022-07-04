import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PublicKey } from '@solana/web3.js';
import { PrismaService } from 'src/prisma/prisma.service';
import { sign } from 'tweetnacl';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: AuthDto) {
    // signed message validation
    const validationMessage = 'Welcome to casinocats';
    const encodedMessage = new TextEncoder().encode(validationMessage);

    const result = sign.detached.verify(
      encodedMessage,
      Uint8Array.from(dto.signature.data),
      Uint8Array.from(dto.publicKey.data),
    );

    if (!result) throw new ForbiddenException('Credentials incorrect');

    const walletAddress: string = new PublicKey(
      Uint8Array.from(dto.publicKey.data),
    ).toBase58();

    // find the user
    const user = await this.prisma.user.findUnique({
      where: {
        walletAddress: walletAddress,
      },
    });

    // if no result then signup and signin
    if (!user) {
      try {
        const user = await this.prisma.user.create({
          data: {
            walletAddress: walletAddress,
            username: walletAddress,
            profilePicture: 'https://picsum.photos/id/237/200/200',
          },
        });
        return this.signToken(user.id, user.walletAddress);
      } catch (e) {
        console.log(e);
      }
    }

    // signin
    return this.signToken(user.id, user.walletAddress);
  }

  async signToken(
    userId: string,
    userWallet: string,
  ): Promise<{ access_token: string }> {
    const secret = this.config.get('JWT_SECRET');
    const payload = {
      sub: userId,
      userWallet: userWallet,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: secret,
    });

    return { access_token: token };
  }
}
