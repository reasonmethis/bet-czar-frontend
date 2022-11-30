import { ethers } from "ethers";
import { useEffect, useReducer, useRef, useState } from "react";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";

import { useSnackbar, VariantType } from "notistack";

import "./App.css";
import {
  CreateBetFormValsT,
  DepositValsT,
  JudgeValsT,
  RpcCallErrorT,
  WithdrawValsT
} from "./components/interfaces";
import { Action, stateInit, stateReducer } from "./StateReducer";
import { shortenHash } from "./utils/utils";
import {parseRpcCallError} from "./components/operations"

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
const Fallback = () => <h2>Loading BetCzar...</h2>;

function App() {
  const [state, dispatchState] = useReducer(stateReducer, stateInit);
  const pollDataIntervalRef = useRef<NodeJS.Timer | undefined>();
  const [fetchingFlg, setFetchingFlg] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    //we update balance only when fetchingFlg (a) changes (b) from false to true
    //(a) is accomplished via the dependency array, (b) - manually
    console.log("ff", fetchingFlg, state.address, !!state.provider);
    if (!state.address) {
      setFetchingFlg(false);
      //_stopPollingData()
      return;
    }
    _ensurePollingData(); //temp, cuz it unmounts on recompile
    if (!fetchingFlg) return;
    updateBalance()
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setFetchingFlg(false);
      });
  }, [fetchingFlg]);

  useEffect(
    () => () => {
      console.log("unmount");
      _stopPollingData();
    },
    []
  );

  //Update user info
  const updateBalance = async () => {
    //force ts to accept provider. We don't need to check it above
    //because if address is defined then provider is defined too -
    //they reset together.
    if (!state.address) return;
    const balance = await state.provider!.getBalance(state.address);
    //setFetchingFlg(false);
    console.log(balance.toString());
    dispatchState({
      type: Action.SET_BALANCE,
      payload: ethers.utils.formatEther(balance),
    });

    //get events associated with user's address
    const betCzar = getContractInstance();
    const filter1 = betCzar.filters.BetCreated(null, state.address, null, null);
    const filter2 = betCzar.filters.BetCreated(null, null, state.address, null);
    const filter3 = betCzar.filters.BetCreated(null, null, null, state.address);
    const promises = [filter1, filter2, filter3].map((f) =>
      betCzar.queryFilter(f)
    );
    const events = await Promise.all(promises);
    console.log(events);
    //save events in state
    dispatchState({ type: Action.SET_ALL_BETS, payload: events });
  };

  // Check if we are on a supported network
  const checkNetwork = () => {
    console.log("network:", window.ethereum.networkVersion);

    const network = cfg.supportedNetworks.find(
      (obj) => obj.id === window.ethereum.networkVersion
    );
    if (network) {
      console.log("setting contract address ", network.contractAddress);
      dispatchState({
        type: Action.SET_CONTRACT,
        payload: network.contractAddress,
      });
      return true;
    }

    const names = cfg.supportedNetworks.map((obj) => obj.name).join(", ");
    alert(`Please switch to one of the supported networks: ${names}`);
    dispatchState({
      type: Action.SET_NETWORK_ERR,
      payload: `Please switch to one of the supported networks: ${names}`,
    });
    return false;
  };

  const initialize = (userAddress: string) => {
    console.log(`Initializing addr ${userAddress}`);

    if (!checkNetwork()) {
      return;
    }

    // We store the user's address
    dispatchState({ type: Action.SET_ADDRESS, payload: userAddress });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // We first initialize ethers by creating a provider using window.ethereum

    //TODO: THIS DOESN'T DEPEND ON USER'S ADDRESS, ONLY ON THE EXISTENCE OF THE
    //WALLET, SO MAYBE MOVE THIS PART
    //ALSO SHOULD BE ABLE TO READ INFO FROM BLOCKCHAIN WITHOUT THE USER CONNECTING
    //so can move this to useEffect that runs on load
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    dispatchState({
      type: Action.SET_PROVIDER,
      payload: provider,
    });
    //NOTE: state.provider is still not set, dispatchState doesn't set things immediately
    //console.log(state.provider) - would still be undefined

    //this._getTokenData();
    _ensurePollingData();
  };

  const _ensurePollingData = () => {
    if (pollDataIntervalRef.current) return;
    console.log("setting interval");
    pollDataIntervalRef.current = setInterval(() => {
      setFetchingFlg(true);
    }, cfg.DT_POLLING_IN_MS);
    // We run it once immediately so we don't have to wait for it
    setFetchingFlg(true);
  };

  const _stopPollingData = () => {
    console.log("clearing interval");
    clearInterval(pollDataIntervalRef.current);
    pollDataIntervalRef.current = undefined;
  };

  const connectWallet = async () => {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    console.log("connecting wallet");
    let accts: string[];
    try {
      console.log("connecting wallet");
      accts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Request to connect returned an error");
      return;
    }
    const [selectedAddress] = accts;
    console.log(accts);
    // Once we have the address, we can initialize the application.

    initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    //TODO should probably only set up this callback once, but what if user clicks
    //connect, then disconnect, then connect again?

    //TODO: NOT WORKING
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

  const getContractInstance = () =>
    new ethers.Contract(
      state.contractAddress!,
      BetCzarArtifact.abi,
      state.provider!.getSigner()
    );

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
        autoHideDuration: cfg.DUR_SNACKBAR,
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

      // If we got here, the transaction was successful, so you may want to
      // update your state.
      enqueueSnackbar(`Tx ${hashShort} complete`, {
        autoHideDuration: cfg.DUR_SNACKBAR,
        variant: "success",
      });
      console.log("Tx successful");
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      const errObj = parseRpcCallError(error);
    
      enqueueSnackbar(errObj.userMsg, {variant: errObj.level as VariantType})
      dispatchState({ type: Action.SET_TX_ERR, payload: errObj.fullMsg });
    } finally {
      console.log("tx attempt done")

      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      dispatchState({ type: Action.SET_TX_BEINGSENT, payload: undefined });
      //Here, we update the user's balance.
      await updateBalance();
    }
  };

  //We define the route structure
  let router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={<Header state={state} connectWallet={connectWallet} />}
      >
        <Route path="*" element={<Home state={state} />} />
        {/* <Route index loader={homeLoader} element={<Home />} />  */}
        <Route index element={<Home state={state} />} />
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
        />{" "}
        {/* <Route path="deferred" loader={deferredLoader} element={<DeferredPage />}>
          <Route
            path="child"
            loader={deferredChildLoader}
            action={deferredChildAction}
            element={<DeferredChild />}
          />
        </Route> 
        <Route
          path="todos"
          action={todosAction}
          loader={todosLoader}
          element={<TodosList />}
          errorElement={<TodosBoundary />}
        >
          <Route path=":id" loader={todoLoader} element={<Todo />} />
        </Route> */}
      </Route>
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
