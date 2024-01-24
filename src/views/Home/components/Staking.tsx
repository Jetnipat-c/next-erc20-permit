import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format2Units } from "@/utils/format";
import { BigNumberish } from "ethers";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Loader } from "lucide-react";

interface StakingProps {
  title: string;
  orangeOfStaking: any;
  mangoOfStaking: any;
  handleApprove: () => void;
  handleStake: () => void;
  handleStakeWithPermit: () => void;
  handleWithdraw: () => void;
  handleChangeAmount: (e: ChangeEvent<HTMLInputElement>) => void;
  allowanceIsLoading: boolean;
  isLoadingStake: boolean;
  allowance: any;
  amount: number;
  isPermit: boolean;
  handleSignTypedData: () => void;
  signTypedIsPending: boolean;
  orangeOfStakingIsLoading: boolean;
  stakeIsLoading: boolean;
}

const Staking = ({
  title,
  orangeOfStaking,
  mangoOfStaking,
  handleApprove,
  handleStake,
  handleStakeWithPermit,
  handleWithdraw,
  handleChangeAmount,
  allowanceIsLoading,
  isLoadingStake,
  allowance = 0,
  amount,
  isPermit,
  handleSignTypedData,
  signTypedIsPending,

  orangeOfStakingIsLoading,
  stakeIsLoading,
}: StakingProps) => {
  if (allowanceIsLoading) {
    return null;
  }
  return (
    <div className="grid gap-1">
      <div className="text-center font-bold">{title}</div>
      {orangeOfStakingIsLoading ? (
        <>
          <Loader className="animate-spin" />
        </>
      ) : (
        <>
          <div>{`BNN (stakingToken): ${format2Units(
            orangeOfStaking as BigNumberish,
            18
          )}`}</div>
          <div>{`MGT (rewardsToken): ${format2Units(
            mangoOfStaking as BigNumberish,
            18
          )}`}</div>
        </>
      )}

      <div className="grid gap-2">
        <Input
          defaultValue={amount}
          onChange={handleChangeAmount}
          type="number"
        />
        <div className="grid grid-cols-2 gap-2">
          {!allowanceIsLoading && allowance <= amount ? (
            <Button onClick={handleApprove} disabled={isLoadingStake}>
              {isLoadingStake ? <Loader className="animate-spin" /> : "Approve"}
            </Button>
          ) : (
            <Button onClick={handleStake} disabled={isLoadingStake}>
              {isLoadingStake ? (
                <Loader className="animate-spin" />
              ) : (
                "Stake with Approve"
              )}
            </Button>
          )}

          {!isPermit ? (
            <Button
              onClick={handleSignTypedData}
              variant="secondary"
              disabled={signTypedIsPending}
            >
              {signTypedIsPending ? (
                <Loader className="animate-spin" />
              ) : (
                "Permit"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleStakeWithPermit}
              variant="secondary"
              disabled={stakeIsLoading}
            >
              {stakeIsLoading ? (
                <Loader className="animate-spin" />
              ) : (
                "Stake with Permit"
              )}
            </Button>
          )}
        </div>
        <Button onClick={handleWithdraw} variant="destructive">
          Withdraw
        </Button>
      </div>
    </div>
  );
};

export default Staking;
