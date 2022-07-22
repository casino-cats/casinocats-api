export const calculateRoundTime = (finalMultiplier: number): number =>
  Number((Math.sqrt(finalMultiplier) * 10).toFixed(3)) * 1000;
