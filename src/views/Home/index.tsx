"use client";

import { BigNumberish } from "ethers";
import { ChangeEvent, useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

import { ERC20ABI } from "@/abi/erc20";
import { format2Units } from "@/utils/format";
import { contractAddress } from "@/constants/contract";

import StakingPool from "./StakingPool";

const HomePage = () => {
  const { address } = useAccount();

  const [isClient, setIsClient] = useState<boolean>(false);

  const bnnOfAccount = useReadContract({
    abi: ERC20ABI,
    address: contractAddress.OrangeToken,
    functionName: "balanceOf",
    args: [address],
  });

  const mgtOfAccount = useReadContract({
    abi: ERC20ABI,
    address: contractAddress.MangoToken,
    functionName: "balanceOf",
    args: [address],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full grid grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-10">
          <StakingPool />
        </div>
        <div>
          <div className="text-center font-bold">Account</div>
          <div>Address: {address}</div>
          <div>
            {`BNN: ${format2Units(bnnOfAccount.data as BigNumberish, 18)}`}
          </div>
          {`MGT: ${format2Units(mgtOfAccount.data as BigNumberish, 18)}`}
        </div>
      </div>
    </main>
  );
};

export default HomePage;
