import { ethers } from "ethers";
import { AllBetsT } from "./components/interfaces";

export type StateProviderT =
  | ethers.providers.Web3Provider
  | ethers.providers.BaseProvider
  | undefined;

export enum Action {
  RESET,
  SET_NETWORK_ERR,
  SET_PROVIDER,
  SET_ADDRESS,
  SET_CONTRACT,
  SET_BALANCE,
  SET_TX_BEINGSENT,
  SET_TX_ERR,
  SET_ALL_BETS,
  SET_WELCOME_STATE,
  WELCOME_MSG_DISMISSED,
  SET_BET_ID_OI,
}

//Different actions have different payload types, so to strongly type
//our action we use a union of several types using the "tagged union" pattern
//see https://medium.com/codex/typescript-and-react-usereducer-943e4f8d1ad4 (counts
//towards Medium's free limit)
type TActionNoPayload = {
  type: Action.RESET | Action.WELCOME_MSG_DISMISSED;
};

type TActionSetStringProperty = {
  type:
    | Action.SET_NETWORK_ERR
    | Action.SET_ADDRESS
    | Action.SET_CONTRACT
    | Action.SET_BALANCE
    | Action.SET_TX_BEINGSENT
    | Action.SET_TX_ERR
    | Action.SET_WELCOME_STATE
    | Action.SET_BET_ID_OI;

  payload: string | undefined;
};

type TActionSetProvider = {
  type: Action.SET_PROVIDER;
  payload: StateProviderT;
};

type TActionSetAllBets = {
  type: Action.SET_ALL_BETS;
  payload: AllBetsT | undefined;
};

export type TAction =
  | TActionNoPayload
  | TActionSetStringProperty
  | TActionSetProvider
  | TActionSetAllBets;

export type StateT = {
  balance: string | undefined;
  address: string | undefined;
  contractAddress: string | undefined;
  networkError: string | undefined;
  provider: StateProviderT;
  txBeingSent: string | undefined;
  txError: string | undefined;
  allBets: AllBetsT | undefined;
  welcomeState: string;
  betIdOI: string | undefined;
};

export const stateInit: StateT = {
  balance: undefined,
  address: undefined,
  contractAddress: undefined,
  networkError: undefined,
  provider: undefined,
  txBeingSent: undefined,
  txError: undefined,
  allBets: undefined,
  welcomeState: "SHW ",
  betIdOI: undefined,
};

export type DispatchStateT = (x: TAction) => void;

export type StateBundleT = {
  val: StateT;
  dispatch: DispatchStateT;
};

export const stateReducer = (state: StateT, action: TAction): StateT => {
  console.log("statereducer: action payload ", (action as any).payload);
  //return state
  switch (action.type) {
    case Action.RESET:
      return { ...stateInit, welcomeState: state.welcomeState };
    case Action.SET_NETWORK_ERR:
      return { ...state, networkError: action.payload };
    case Action.SET_PROVIDER:
      return { ...state, provider: action.payload };
    case Action.SET_ADDRESS:
      return { ...state, address: action.payload };
    case Action.SET_CONTRACT:
      return { ...state, contractAddress: action.payload };
    case Action.SET_BALANCE:
      return { ...state, balance: action.payload };
    case Action.SET_TX_BEINGSENT:
      return { ...state, txBeingSent: action.payload };
    case Action.SET_TX_ERR:
      return { ...state, txError: action.payload };
    case Action.SET_ALL_BETS:
      return { ...state, allBets: action.payload };
    case Action.SET_WELCOME_STATE:
      return { ...state, welcomeState: action.payload ?? "" };
    case Action.WELCOME_MSG_DISMISSED:
      return {
        ...state,
        welcomeState: state.welcomeState.replace("SHW", "DSM"),
      };
    case Action.SET_BET_ID_OI:
      return { ...state, betIdOI: action.payload };
    default:
      return state;
  }
};
