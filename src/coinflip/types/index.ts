export type RoundInfoType = {
  roundId: number;
  locked: boolean;
  result: number;
  serverSeed: string;
  creatorSeed: string;
  challengerSeed: string;
  betAmount: number;
  creatorId: string;
  creatorChosenSide: number;
  challengerId: string;
};
