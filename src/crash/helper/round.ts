export const getTimeFromMultiplier = (finalMultiplier: number): number =>
  Number(Math.log2(Math.pow(finalMultiplier, 10)).toFixed(3)) * 1000;
