import { ethers } from "ethers";
import { useEffect, useReducer, useRef, useState } from "react";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import { useSnackbar, VariantType } from "notistack";

import "./App.css";
import {
  CreateBetFormValsT,
  DepositValsT,
  JudgeValsT,
  WithdrawValsT,
} from "./components/interfaces";
import {
  parseRpcCallError,
  updateBalance,
  updateBalanceAndBetInfo,
} from "./components/operations";
import { Action, StateBundleT, stateInit, stateReducer } from "./StateReducer";
import { shortenHash } from "./utils/utils";

import { CreateBetForm } from "./components/CreateBetForm";
import { Deposit } from "./components/Deposit";
import Header from "./components/Header";
import { Home } from "./components/Home";
import { Judge } from "./components/Judge";
import { Withdraw } from "./components/Withdraw";

// Import various constants and settings, incl supported networks
import * as cfg from "./constants";

// We import the contract's artifacts and address here
import BetCzarArtifact from "./contracts/BetCzar.json";
//import contractAddress from "./contracts/contract-address.json";

declare let window: any; //without this Typescript complains that window doesn't have
//attr ethereum. There are probably better approaches (maybe ones in https://stackoverflow.com/questions/70961190/property-ethereum-does-not-exist-on-type-window-typeof-globalthis-error), but
//this one seems to work. It's taken from https://dev.to/yakult/a-beginers-guide-four-ways-to-play-with-ethersjs-354a

/*
if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
*/
enum FetchingState {
  NOT_FETCHING,
  BALANCE_FETCH,
  FULL_FETCH,
}

function App() {
  const [state, dispatchState] = useReducer(stateReducer, stateInit);
  const pollDataIntervalRef = useRef<NodeJS.Timer | undefined>();
  const [fetchingFlg, setFetchingFlg] = useState(FetchingState.NOT_FETCHING);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const sstate: StateBundleT = { val: state, dispatch: dispatchState };

  useEffect(() => {
    //we update balance only when fetchingFlg (a) changes (b) from false to true
    //(a) is accomplished via the dependency array, (b) - manually

    if (!state.address) {
      setFetchingFlg(FetchingState.NOT_FETCHING);
      //_stopPollingData()
      return;
    }
    _ensurePollingData(); //temp, cuz it unmounts on recompile
    if (fetchingFlg === FetchingState.NOT_FETCHING) return;

    try {
      if (fetchingFlg === FetchingState.BALANCE_FETCH) updateBalance(sstate);
      else updateBalanceAndBetInfo(sstate);
    } catch (err) {
      console.log("error fetching user info: ", err);
    } finally {
      setFetchingFlg(FetchingState.NOT_FETCHING);
    }
  }, [fetchingFlg]);

  useEffect(
    () => () => {
      console.log("unmount");
      _stopPollingData();
    },
    []
  );

  // Check if we are on a supported network
  const checkNetworkAndSetContractAddr = (isFake: boolean) => {
    const networkId = isFake
      ? cfg.TEST_NETWORK_ID
      : window.ethereum.networkVersion;
    console.log("network:", networkId);

    const network = cfg.supportedNetworks.find((obj) => obj.id === networkId);
    if (network) {
      console.log("setting contract address ", network.contractAddress);
      dispatchState({
        type: Action.SET_CONTRACT,
        payload: network.contractAddress,
      });
      return true;
    }

    const names = cfg.supportedNetworks.map((obj) => obj.name).join(", ");
    enqueueSnackbar(
      `Please switch to one of the supported networks: ${names}`,
      { variant: "warning" }
    );
    dispatchState({
      type: Action.SET_NETWORK_ERR,
      payload: `Please switch to one of the supported networks: ${names}`,
    });
    return false;
  };

  const initialize = (userAddress: string) => {
    const isFake = false; //userAddress === cfg.TEST_ADDR;
    console.log(`Initializing addr ${userAddress}`);

    if (!checkNetworkAndSetContractAddr(isFake)) {
      return;
    }

    // We store the user's address
    dispatchState({ type: Action.SET_ADDRESS, payload: userAddress });

    // Initialize ethers by creating a provider using window.ethereum

    //TODO: THIS DOESN'T DEPEND ON USER'S ADDRESS, ONLY ON THE EXISTENCE OF THE
    //WALLET, SO MAYBE MOVE THIS PART
    //ALSO SHOULD BE ABLE TO READ INFO FROM BLOCKCHAIN WITHOUT THE USER CONNECTING
    //so can move this to useEffect that runs on load

    //https://goerli-light.eth.linkpool.io/" //access blocked by CORS
    //"https://rpc.ankr.com/eth_goerli" //blockrange too wide
    //"https://eth-goerli.public.blastapi.io" //eth_getlogs is not available on our public api

    const provider = isFake
      ? new ethers.providers.JsonRpcProvider(cfg.TEST_RPC)
      : new ethers.providers.Web3Provider(window.ethereum);

    dispatchState({
      type: Action.SET_PROVIDER,
      payload: provider,
    });

    //NOTE: state.provider is still not set, dispatchState doesn't set things immediately
    //console.log(state.provider) - would still be undefined
    _ensurePollingData();
  };

  const _ensurePollingData = () => {
    if (pollDataIntervalRef.current) return;
    console.log("setting polling interval");
    pollDataIntervalRef.current = setInterval(() => {
      setFetchingFlg(FetchingState.BALANCE_FETCH);
    }, cfg.DT_POLLING_IN_MS);
    // Set it immediately so we don't have to wait for it
    setFetchingFlg(FetchingState.FULL_FETCH);
  };

  const _stopPollingData = () => {
    console.log("clearing interval");
    clearInterval(pollDataIntervalRef.current);
    pollDataIntervalRef.current = undefined;
  };

  const connectWallet = async (isFake: boolean) => {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    //for now we won't allow non-metamask connections
    if (isFake) {
      enqueueSnackbar("Please install Metamask to connect", {
        variant: "info",
      });
      return;
    }

    let selectedAddress: string;
    if (isFake) {
      selectedAddress = cfg.TEST_ADDR;
    } else {
      try {
        console.log("connecting wallet");
        [selectedAddress] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("addr ", selectedAddress);
      } catch (error) {
        console.log(error);
        enqueueSnackbar("Request to connect was rejected", { variant: "info" });
        return;
      }
    }

    initialize(selectedAddress);

    if (!window.ethereum) return;
    // We reinitialize it whenever the user changes their account.
    //TODO should probably only set up this callback once, but what if user clicks
    //connect, then disconnect, then connect again?
    window.ethereum.on("accountsChanged", ([newAddress]: string[]) => {
      console.log("on accountsChanged");
      _stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        dispatchState({ type: Action.RESET });
        return;
      }
      initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    //TODO see above
    window.ethereum.on("chainChanged", ([]) => {
      console.log("chain chng");
      _stopPollingData();
      dispatchState({ type: Action.RESET });
    });
  };

  const getContractInstance = () => {
    if (!(state.provider instanceof ethers.providers.Web3Provider))
      throw Error("Can't sign transactions, need Web3Provider");
    return new ethers.Contract(
      state.contractAddress!,
      BetCzarArtifact.abi,
      state.provider.getSigner()
    );
  };
  const makeCreateBetTxPromise = (
    vals: CreateBetFormValsT
  ): Promise<ethers.providers.TransactionResponse> => {
    // We initialize the contract using the provider and the token's artifact.
    const betCzar = getContractInstance();
    //https://docs.ethers.io/v5/api/utils/display-logic/#unit-conversion
    const amt1 = ethers.utils.parseUnits(vals.amt1, "ether");
    const amt2 = ethers.utils.parseUnits(vals.amt2, "ether");
    return betCzar.createBet(
      vals.bettor1,
      vals.bettor2,
      vals.judge,
      amt1,
      amt2
    );
  };

  const makeDepositTxPromise = (
    vals: DepositValsT
  ): Promise<ethers.providers.TransactionResponse> => {
    // We initialize the contract using the provider and the token's artifact.
    const betCzar = getContractInstance();
    if (vals.isBettor1)
      return betCzar.deposit1(+vals.betId, { value: vals.amt });
    return betCzar.deposit2(+vals.betId, { value: vals.amt });
  };

  const makeWithdrawTxPromise = (
    vals: WithdrawValsT
  ): Promise<ethers.providers.TransactionResponse> => {
    // We initialize the contract using the provider and the token's artifact.
    const betCzar = getContractInstance();
    if (vals.isWon) return betCzar.sendWinnings(+vals.betId);
    if (!vals.isCancelled) return betCzar.recallDeposit(+vals.betId);
    if (vals.isBettor1) return betCzar.sendRefund1(+vals.betId);
    return betCzar.sendRefund2(+vals.betId);
  };
  const makeJudgeTxPromise = (
    vals: JudgeValsT
  ): Promise<ethers.providers.TransactionResponse> => {
    // We initialize the contract using the provider and the token's artifact.
    const betCzar = getContractInstance();
    if (vals.isJudge) return betCzar.adjudicate(+vals.betId, vals.winner);
    return betCzar.forfeit(+vals.betId);
  };

  const sendTx = async (
    txPromise: Promise<ethers.providers.TransactionResponse>
  ) => {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    if (!state.provider) return;
    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      dispatchState({ type: Action.SET_TX_ERR, payload: undefined });

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      //sgnr = state.provider.sendTransaction
      const tx = await txPromise;
      const hashShort = shortenHash(tx.hash);
      enqueueSnackbar(`Tx ${hashShort} processing`, {
        autoHideDuration: cfg.DUR_SNACKBAR_TX,
      });
      console.log(tx.hash);
      dispatchState({ type: Action.SET_TX_BEINGSENT, payload: tx.hash });

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();
      console.log("tx receipt", receipt);

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        enqueueSnackbar(`Tx ${hashShort} failed`, {
          autoHideDuration: cfg.DUR_SNACKBAR,
          variant: "error",
        });
        throw new Error("Transaction failed, receipt has status = 0");
      }

      // If we got here, the transaction was successful
      enqueueSnackbar(`Tx ${hashShort} complete`, {
        autoHideDuration: cfg.DUR_SNACKBAR,
        variant: "success",
      });
      console.log("Tx successful");
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      const errObj = parseRpcCallError(error);

      enqueueSnackbar(errObj.userMsg, { variant: errObj.level as VariantType });
      dispatchState({ type: Action.SET_TX_ERR, payload: errObj.fullMsg });
    } finally {
      console.log("tx attempt done");

      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      dispatchState({ type: Action.SET_TX_BEINGSENT, payload: undefined });
      //update all user info
      await updateBalanceAndBetInfo(sstate);
    }
  };

  //We define the route structure
  let router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="*" element={<Navigate to={cfg.ROUTE_PREFIX} />} />
        <Route
          path={cfg.ROUTE_PREFIX}
          element={<Header state={state} connectWallet={connectWallet} />}
        >
          {/* <Route index loader={homeLoader} element={<Home />} />  */}
          <Route index element={<Home sstate={sstate} />} />
          <Route
            path="newbet"
            element={
              <CreateBetForm
                isDisabled={!state.address}
                onSubmit={(vals) => {
                  sendTx(makeCreateBetTxPromise(vals));
                }}
              />
            }
          />
          <Route
            path="deposit"
            element={
              <Deposit
                state={state}
                onSubmit={(vals) => {
                  sendTx(makeDepositTxPromise(vals));
                }}
              />
            }
          />
          <Route
            path="withdraw"
            element={
              <Withdraw
                state={state}
                onSubmit={(vals) => {
                  sendTx(makeWithdrawTxPromise(vals));
                }}
              />
            }
          />{" "}
          <Route
            path="judge"
            element={
              <Judge
                state={state}
                onSubmit={(vals) => {
                  sendTx(makeJudgeTxPromise(vals));
                }}
              />
            }
          />
        </Route>
      </>
    )
  );
  //We render the Dapp
  return <RouterProvider router={router} />;
  /*if (!window.ethereum) {
    return (
      <>
        <Header />
        <NoWallet />
      </>
    );
  } */
}

export default App;
