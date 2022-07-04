import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

@Injectable()
export class SolanaService {
  private connection: Connection;

  constructor(private config: ConfigService) {
    this.connection = new Connection(config.get('SOLANA_NETWORK'));
  }

  async getTokensInWallet(walletPubkey: PublicKey): Promise<string[]> {
    const { value: splAccounts } =
      await this.connection.getParsedTokenAccountsByOwner(walletPubkey, {
        programId: TOKEN_PROGRAM_ID,
      });

    const nftAccounts = splAccounts.filter((t) => {
      const amount = t.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
      const decimals = t.account?.data?.parsed?.info?.tokenAmount?.decimals;
      return decimals === 0 && amount === 1;
    });

    const tokenList = await Promise.all(
      nftAccounts.map((nftAccount) => {
        const address = nftAccount.account.data.parsed.info.mint;
        return address;
      }),
    );

    return tokenList;
  }
}
