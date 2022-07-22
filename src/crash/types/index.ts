export type CrashRoundInfo = {
  roundId: number;
  finalMultiplier: number;
  hash: string;
  seed: string;
  startTime: number;
  endTime: number;
};

export type CrashBetInfo = {
  userId: string;
  betAmount: number;
  multiplier: number;
};

export enum CRASH_ROUND_STATES {
  BETTING = 'Betting',
  CRASH = 'Crash',
  PREPARATION = 'Preparation',
}

export const MULTIPLIER_GRAPH_COEFFICIENT = 0.3;
