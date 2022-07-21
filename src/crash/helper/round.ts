import { MULTIPLIER_GRAPH_COEFFICIENT } from '../types';

export const calculateRoundTime = (finalMultiplier: number): number =>
  Number(Math.sqrt(finalMultiplier / MULTIPLIER_GRAPH_COEFFICIENT).toFixed(3)) *
  1000;
