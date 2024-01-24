import { BigNumberish, formatUnits } from "ethers";

export const format2Units = (value: BigNumberish = 0, decimals = 18) => {
  return formatUnits(value, decimals);
};
