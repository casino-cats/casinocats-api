import { IsNotEmpty } from 'class-validator';

export class CreateDto {
  @IsNotEmpty()
  creatorChosenSide: number;

  @IsNotEmpty()
  betAmount: number;
}
