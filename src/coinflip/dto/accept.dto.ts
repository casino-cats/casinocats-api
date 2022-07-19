import { IsNotEmpty } from 'class-validator';

export class AcceptDto {
  @IsNotEmpty()
  roundId: number;
}
