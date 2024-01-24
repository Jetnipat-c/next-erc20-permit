"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSignTypedData,
} from "wagmi";
import { ethers, parseEther } from "ethers";
import { ChangeEvent, useEffect, useState } from "react";

import Staking from "./components/Staking";

import { ERC20ABI } from "@/abi/erc20";
import { contractAddress } from "@/constants/contract";

import { toast } from "@/components/ui/use-toast";
import { STAKINGABI } from "@/abi/staking";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

const StakingPool = () => {
  const { address } = useAccount();
  const currentDate = new Date();

  // Add one day (in milliseconds)
  const nextDay = new Date(currentDate);
  nextDay.setDate(currentDate.getDate() + 1);

  // Set the time to midnight (00:00:00)
  nextDay.setHours(0, 0, 0, 0);

  // Get the Unix timestamp for the fixed deadline
  const deadline = Math.floor(nextDay.getTime() / 1000);
  const [amount, setAmount] = useState<number>(10);

  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const {
    data: signTypedData,
    signTypedData: writeSignTypedData,
    isPending: signTypedIsPending,
    isSuccess: signTypedIsSuccess,
  } = useSignTypedData();

  //     Approved
  const {
    data: approvedData,
    isPending: approveIsPending,
    writeContract: writeApproveContract,
  } = useWriteContract();

  const { data: approvedReceipt, isLoading: approveIsLoading } =
    useWaitForTransactionReceipt({
      hash: approvedData,
    });

  //   Staking
  const { data: stakingData, writeContract: writeStakingContract } =
    useWriteContract();

  //   Staking with permit
  const {
    data: stakingPermitData,
    isPending: stakePermitIsPending,
    writeContract: writeStakingPermitContract,
  } = useWriteContract();

  //   Staking with permit
  const {
    data: stakingPermitData2,
    isPending: stakePermitIsPending2,
    writeContract: writeStakingPermitContract2,
  } = useWriteContract();

  const { isLoading: stakeIsLoading } = useWaitForTransactionReceipt({
    hash: stakingPermitData,
  });

  console.log("stakeIsLoading", stakeIsLoading, stakePermitIsPending);

  //   Get nonce
  const { data: nonces } = useReadContract({
    abi: ERC20ABI,
    address: contractAddress.OrangeToken,
    functionName: "nonces",
    args: [address],
  });

  // Event
  const { data: stakingReceipt } = useWaitForTransactionReceipt({
    hash: stakingData,
  });

  const { data: stakingPermitReceipt } = useWaitForTransactionReceipt({
    hash: stakingPermitData,
  });

  const [isClient, setIsClient] = useState<boolean>(false);

  const {
    data: orangeOfStaking,
    refetch: orangeOfStakingRefetch,
    isLoading: orangeOfStakingIsLoading,
  } = useReadContract({
    abi: ERC20ABI,
    address: contractAddress.OrangeToken,
    functionName: "balanceOf",
    args: [contractAddress.Staking],
  });

  const { data: mangoOfStaking, refetch: mangoOfStakingRefetch } =
    useReadContract({
      abi: ERC20ABI,
      address: contractAddress.MangoToken,
      functionName: "balanceOf",
      args: [contractAddress.Staking],
    });

  const {
    data: allowanceOfAccount,
    isLoading: allowanceIsLoading,
    refetch: allowanceRefetch,
  } = useReadContract({
    abi: ERC20ABI,
    address: contractAddress.OrangeToken,
    functionName: "allowance",
    args: [address, contractAddress.Staking],
  });

  const handleApprove = () => {
    if (amount <= 0) {
      toast({
        title: "Amount must be greater than 0",
        description: "Please enter amount",
        variant: "destructive",
      });
      return;
    }

    writeApproveContract({
      abi: ERC20ABI,
      address: contractAddress.OrangeToken,
      functionName: "approve",
      args: [contractAddress.Staking, parseEther(amount.toString())],
    });
  };

  const handleStakeWithApprove = async () => {
    writeStakingContract({
      abi: STAKINGABI,
      address: contractAddress.Staking,
      functionName: "stake",
      args: [parseEther(amount.toString())],
    });
  };

  const handleSignTypedData = () => {
    if (amount <= 0) {
      toast({
        title: "Amount must be greater than 0",
        description: "Please enter amount",
        variant: "destructive",
      });
      return;
    }

    if (!address) return;

    writeSignTypedData({
      types: {
        EIP712Domain: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "version",
            type: "string",
          },
          {
            name: "chainId",
            type: "uint256",
          },
          {
            name: "verifyingContract",
            type: "address",
          },
        ],
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "Permit",
      domain: {
        name: "OrangeToken",
        version: "1",
        chainId: BigInt(11155111),
        verifyingContract: contractAddress.OrangeToken,
      },
      message: {
        owner: address,
        spender: contractAddress.Staking,
        value: parseEther(amount.toString()),
        nonce: BigInt(nonces as number), //you will get once you import the erc20permit contract
        deadline: BigInt(deadline), // future timestamp
      },
    });
  };

  const handleStakeWithPermit = () => {
    const { v, r, s } = ethers.Signature.from(signTypedData);
    console.log("vrs =", v, r, s);
    writeStakingPermitContract({
      abi: STAKINGABI,
      address: contractAddress.Staking,
      functionName: "stakeWithPermit",
      args: [
        address,
        contractAddress.Staking,
        parseEther(amount.toString()),
        deadline,
        v,
        r,
        s,
      ],
    });
  };

  const handleWithdraw = () => {};

  const handleCopySignature = () => {
    navigator.clipboard.writeText(signTypedData?.toString() || "");
    toast({
      title: "Copied",
      description: "Signature copied to clipboard",
    });
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    allowanceRefetch();
  }, [approvedReceipt]);

  useEffect(() => {
    orangeOfStakingRefetch();
    mangoOfStakingRefetch();
  }, [stakingReceipt, stakingPermitReceipt]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4">
      <div>
        <span className="mr-3 break-words w-full">
          Signature: {signTypedData}
        </span>
        <Button onClick={() => handleCopySignature()} variant="outline">
          <Copy size={14} />
        </Button>
      </div>
      <Staking
        title="Staking pool"
        orangeOfStaking={orangeOfStaking}
        mangoOfStaking={mangoOfStaking}
        handleApprove={handleApprove}
        handleStake={handleStakeWithApprove}
        handleStakeWithPermit={handleStakeWithPermit}
        handleWithdraw={handleWithdraw}
        handleChangeAmount={handleChangeAmount}
        allowanceIsLoading={allowanceIsLoading}
        isLoadingStake={approveIsPending || approveIsLoading}
        allowance={allowanceOfAccount}
        amount={amount}
        isPermit={signTypedIsSuccess}
        handleSignTypedData={handleSignTypedData}
        signTypedIsPending={signTypedIsPending}
        orangeOfStakingIsLoading={orangeOfStakingIsLoading}
        stakeIsLoading={stakeIsLoading || stakePermitIsPending}
      />
    </div>
  );
};
export default StakingPool;
