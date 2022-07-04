import { IsNotEmpty } from 'class-validator';
export class AuthDto {
  @IsNotEmpty()
  publicKey: any;

  @IsNotEmpty()
  signature: any;
}
