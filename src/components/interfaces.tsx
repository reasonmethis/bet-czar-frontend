import { ethers } from "ethers";
import { IState } from "../StateReducer";

export const CreateBetFormInitVals = {
  bettor1: "",
  amt1: "",
  bettor2: "",
  amt2: "",
  judge: "",
};
export type CreateBetFormValsT = typeof CreateBetFormInitVals;

export type CreateBetFormPropsT = {
  isDisabled: boolean;
  onSubmit: (vals: CreateBetFormValsT) => void;
};

export type DepositValsT = {
  betId: string;
  isBettor1: boolean;
  amt: string;
};

export type DepositPropsT = {
  state: IState;
  onSubmit: (vals: DepositValsT) => void;
};

export type WithdrawValsT = {
  betId: string;
  isBettor1: boolean;
  isWon: boolean; //then use sendWinnings
  isCancelled: boolean; //then sendRefund1/2, else recallDeposit
};

export type WithdrawPropsT = {
  state: IState;
  onSubmit: (vals: WithdrawValsT) => void;
};

export type JudgeValsT = {
  betId: string;
  isJudge: boolean;
  winner: 0 | 1 | 2;
};

export type JudgePropsT = {
  state: IState;
  onSubmit: (vals: JudgeValsT) => void;
};

export const SelectBetFormInitVals = {
  betId: "",
};
export type SelectBetFormValsT = typeof SelectBetFormInitVals;

export type SelectBetFormPropsT = {
  isDisabled: boolean;
  onSubmit: (vals: SelectBetFormValsT) => void;
};

//export type AllBetsT = ethers.Event[][];
export type AllBetsT = {
  statusesFetched: boolean,
  betIdsForRoles: string[][],
  betInfoMap: Map<string, BetInfoT>
}

export const betStatusDescriptions = [
  "Awaiting Bettors' deposits",
  "Awaiting Bettor 1's deposit",
  "Awaiting Bettor 2's deposit",
  "In progress, awaiting adjudication",
  "Bettor 1 won, can claim winnings",
  "Bettor 2 won, can claim winnings",
  "Bettor 1 won and withdrew winnings",
  "Bettor 2 won and withdrew winnings",
  "Annulled by Judge, bettors can withdraw",
  "Annulled by Judge, Bettor 2 still needs to withdraw",
  "Annulled by Judge, Bettor 1 still needs to withdraw",
  "Annulled by Judge, bettors withdrew deposits",
  "Unknown status",
];

export enum BetStatus {
  CREATED = 0,
  WAITING_FOR1,
  WAITING_FOR2,
  PENDING,
  WON1,
  WON2,
  CLAIMED1,
  CLAIMED2,
  CANCELED,
  CLAIMED_REFUND1,
  CLAIMED_REFUND2,
  CLAIMED_REFUNDS,
  UNKNOWN,
}

export enum RpcCallErrorStatus {
  UNDEFINED,
  NO_ERROR,
  RECOGNIZED_RPC_ERROR,
  OTHER_ERROR,
}

export type TxCodeT = { code: string; userMsg: string; level: string };

export const RpcCallErrorInitVals = {
  status: RpcCallErrorStatus.UNDEFINED,
  code: "",
  method: "",
  fullMsg: "",
  userMsg: "",
  level: "",
};

export type RpcCallErrorT = typeof RpcCallErrorInitVals;
export type BetHistoryEntryT = {
  blockNumber: number,
  status: BetStatus
}

const tmp = {
  betId: "",
  bettor1: "",
  bettor2: "",
  judge: "",
  amt1: "",
  amt2: "",
  status: BetStatus.UNKNOWN,
  history: [] as BetHistoryEntryT[],
  error: RpcCallErrorInitVals as Readonly<RpcCallErrorT>,
};

export type BetInfoT = typeof tmp;
export const betInfoInitVals: Readonly<BetInfoT> = tmp;
