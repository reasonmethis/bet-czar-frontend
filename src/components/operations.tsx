import { ethers } from "ethers";

import BetCzarArtifact from "../contracts/BetCzar.json";

import {
  betInfoInitVals,
  BetInfoT,
  BetStatus,
  RpcCallErrorInitVals,
  RpcCallErrorStatus,
  RpcCallErrorT,
} from "./interfaces";

import * as cfg from "../constants";
import { Action, StateBundleT, StateProviderT } from "../StateReducer";

//TODO CHECK FOR NEW EVENTS
export const updateBalanceAndBetInfo = async (sstate: StateBundleT) => {
  await Promise.all([updateAllBetsInfo(sstate), updateBalance(sstate)]);
};

export const updateBalance = async ({
  val: state,
  dispatch: dispatchState,
}: StateBundleT) => {
  if (!state.address || !state.provider) return;

  let balSt: string;
  try {
    const balance = await state.provider.getBalance(state.address);
    balSt = ethers.utils.formatEther(balance);
  } catch (e) {
    //balSt = "NA"; //causes shown balance to temporarily change to NA if
    //there's a temporary Metamask/connection error
    console.log("Error fetching balance: ", e);
    return; //TODO some logic if can't fetch for a while
  }

  dispatchState({
    type: Action.SET_BALANCE,
    payload: balSt,
  });
};

export const updateAllBetsInfo = async ({
  val: state,
  dispatch: dispatchState,
}: StateBundleT) => {
  if (!state.address || !state.provider) return;

  //get events associated with user's address
  const betCzar = getReadContractInstance(
    state.provider!,
    state.contractAddress!
  );
  const filter1 = betCzar.filters.BetCreated(null, state.address, null, null);
  const filter2 = betCzar.filters.BetCreated(null, null, state.address, null);
  const filter3 = betCzar.filters.BetCreated(null, null, null, state.address);
  console.log("filters done");
  const promises = [filter1, filter2, filter3].map(
    (f) => betCzar.queryFilter(f, 0) //TODO init blockNumber
  );
  const eventss = await Promise.all(promises);

  //record betIds for each role and a map from each betId to a betInfo object
  const betInfoMap = new Map<string, BetInfoT>();
  const betIdsForRoles: string[][] = [];
  for (const events of eventss) {
    const betIdsForRole: string[] = [];
    //seems using a regular for loop may be more efficient than using forEach:
    //https://stackoverflow.com/questions/32682962/javascript-loop-through-array-backwards-with-foreach
    //Also, forEach can't go in reverse. Though can use reduceRight instead

    //Events come in chronological order, so by looping in reverse we 
    //are putting latest created bets first: both in the three betIdsForRole arrays
    //and in the betInfoMap order of keys (betIds)
    for (let i = events.length - 1; i >= 0; i--) {
      const betId = events[i].args![0].toString();
      betIdsForRole.push(betId);
      if (!betInfoMap.has(betId))
        betInfoMap.set(betId, convertCreateBetEventToBetInfo(events[i]));
    }
    betIdsForRoles.push(betIdsForRole);
  }
  const betIds = Array.from(betInfoMap.keys());
  console.log(betIds.length, " user's bets: ", betIds);

  if (state.allBets) {
     if (state.allBets.betInfoMap.size < betInfoMap.size) {
      const newBetId =  betInfoMap.size - 1
      console.log("new bet, bet id ", newBetId);
      //make it the current betid oi - NAH, NOT A GOOD IDEA
      //what if I am on a Deposit page and a new bet is created, 
      //dispatchState({type: Action.SET_BET_ID_OI, payload: newBetId.toString()})
     }
  }

  //save bets info in state
  dispatchState({
    type: Action.SET_ALL_BETS,
    payload: {
      statusesFetched: false,
      betIdsForRoles: betIdsForRoles,
      betInfoMap: betInfoMap,
    },
  });
  //    dispatchState({ type: Action.SET_ALL_BETS, payload: eventss });

  //get current statuses for all found bets, this will modify the values of betInfoMap
  await fetchStatusesForBets(betInfoMap, betCzar);
  console.log("statuses fetched, saving");
  //save bets info in state
  dispatchState({
    type: Action.SET_ALL_BETS,
    payload: {
      statusesFetched: true,
      betIdsForRoles: betIdsForRoles,
      betInfoMap: betInfoMap,
    },
  });
};

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

export const convertCreateBetEventToBetInfo = (
  event: ethers.Event
): BetInfoT => {
  const betInfo = { ...betInfoInitVals };
  if (!event.args) return betInfo; //shouldn't happen
  //we extract the info and populate betInfo
  betInfo.betId = event.args[0].toString();
  betInfo.bettor1 = event.args[1];
  betInfo.bettor2 = event.args[2];
  betInfo.judge = event.args[3];
  betInfo.amt1 = event.args[4].toString();
  betInfo.amt2 = event.args[5].toString();
  betInfo.history = [
    //need to assign, not push, because otherwise
    //different betInfos history arrays are actually the same reference
    {
      blockNumber: event.blockNumber,
      status: BetStatus.CREATED,
    },
  ];
  //betInfo.status = res.status;
  betInfo.error = { ...betInfo.error, status: RpcCallErrorStatus.NO_ERROR };
  return betInfo;
};

export const fetchBetInfo = async (
  betId: string,
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
    betInfo.betId = betId;
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

export const fetchStatusesForBets = async (
  betInfoMap: Map<string, BetInfoT>,
  contract: ethers.Contract
) => {
  //const betInfo = { ...betInfoInitVals }; //see above
  const betIds = Array.from(betInfoMap.keys());
  try {
    //const contract = getReadContractInstance(provider!, contractAddress!);

    //get all status change events for all user's bets
    const filter = contract.filters.BetStatusChange(betIds);

    const events = await contract.queryFilter(filter, 0); //TODO incl init block

    //clear previous history of each bet. Will leave the first item, because it's
    //from the Create event, not from a status change event
    for (const betInfo of betInfoMap.values()) betInfo.history.length = 1;
    //populate the history of all user's Bets
    for (const event of events) {
      betInfoMap.get(event.args?.betId.toString())?.history.push({
        blockNumber: event.blockNumber,
        status: event.args!.newStatus,
      });
    }

    //determine and record the current state of all bets
    for (const [_, betInfo] of betInfoMap) {
      betInfo.status = betInfo.history[betInfo.history.length - 1].status;
      console.log("History for betId", betInfo.betId, betInfo.history);
    }
  } catch (error) {
    const parsedError = parseRpcCallError(error);
    console.log(parsedError);
  }
};
