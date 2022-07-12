import { IsNotEmpty } from 'class-validator';

export class CreateDto {
  @IsNotEmpty()
  creatorId: string;

  @IsNotEmpty()
  creatorChosenSide: number;

  @IsNotEmpty()
  betAmount: number;
}
