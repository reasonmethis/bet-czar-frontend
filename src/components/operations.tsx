//import {IState} from "../StateReducer"
import { ethers } from "ethers";
// We import the contract's artifacts and address here
import BetCzarArtifact from "../contracts/BetCzar.json";

import {
  betInfoInitVals,
  RpcCallErrorInitVals,
  RpcCallErrorStatus,
  RpcCallErrorT,
} from "./interfaces";

import * as cfg from "../constants";
import { StateProviderT } from "../StateReducer";

export const getReadContractInstance = (
  provider: ethers.providers.BaseProvider,
  contractAddress: string
) => new ethers.Contract(contractAddress, BetCzarArtifact.abi, provider);

export const parseRpcCallError = (error: any): RpcCallErrorT => {
  const res: RpcCallErrorT = { ...RpcCallErrorInitVals };

  let txCodeObj = cfg.txCodes.find((x) => x.code === error.code);
  if (txCodeObj) {
    res.status = RpcCallErrorStatus.RECOGNIZED_RPC_ERROR;
    res.code = txCodeObj.code;
    res.userMsg = txCodeObj.userMsg;
    res.level = txCodeObj.level;
  } else {
    res.status = RpcCallErrorStatus.OTHER_ERROR;
    res.code = error.code === undefined ? "" : `${error.code}`;
    res.userMsg = "Error encountered";
    res.level = "error";
  }
  //populate the rest of the fields
  res.method = error.method ?? "";
  res.fullMsg = error.message ?? `${error}`;

  console.log("got error:", res);
  return res;
};

export const fetchBetInfo = async (
  betId: number,
  provider: StateProviderT,
  contractAddress: string | undefined
) => {
  //let betInfo = BetInfoInitVals; //PITFALL - this, in combination with the
  //next several lines, would modify BetInfoInitVals. Setting its type to readonly
  //helps catch this at compile time
  const betInfo = { ...betInfoInitVals }; //see above
  try {
    const betCzar = getReadContractInstance(provider!, contractAddress!);
    const res = await betCzar.bets(betId);
    //we extract the info and populate betInfo
    betInfo.betId = betId.toString();
    betInfo.bettor1 = res.bettor1;
    betInfo.bettor2 = res.bettor2;
    betInfo.judge = res.judge;
    betInfo.amt1 = res.amt1.toString();
    betInfo.amt2 = res.amt2.toString();
    betInfo.status = res.status;
    betInfo.error = { ...betInfo.error, status: RpcCallErrorStatus.NO_ERROR };
  } catch (error) {
    betInfo.error = parseRpcCallError(error);
    console.log(betInfo.error);
  }
  return betInfo;
};
