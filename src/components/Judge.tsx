import { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import BetInformation from "./BetInformation";

import {
  betInfoInitVals,
  BetStatus,
  betStatusDescriptions,
  JudgePropsT,
  RpcCallErrorStatus,
} from "./interfaces";
import { fetchBetInfo } from "./operations";
import { PageHeading } from "./PageHeading";
import { SelectBetForm } from "./SelectBetForm";
import { StatusMsgNonHome } from "./StatusMsgNonHome";

const statusTypographyvariant = "subtitle2";

type JudgeBtnProps = {
  isJudge: boolean;
  winner: 0 | 1 | 2;
};

export const Judge = (props: JudgePropsT) => {
  const [betInfo, setBetInfo] = useState({ ...betInfoInitVals });
  const [betId, setBetId] = useState(-1);

  useEffect(() => {
    if (props.state.txBeingSent || betId < 0) return;
    //if txbeingsent changed from something to nothing then maybe
    //the bet status changed, so refetch
    const func = async () => {
      const newBetInfo = await fetchBetInfo(
        betId,
        props.state.provider,
        props.state.contractAddress
      );
      setBetInfo({ ...newBetInfo });
    };
    func();
  }, [props.state.txBeingSent]);

  useEffect(() => {
    setBetInfo({ ...betInfoInitVals });
  }, [betId]);

  //console.log("def dep btn, betid = ", betId, "status =", betInfo.status);
  const JudgeBtn = ({ winner, isJudge }: JudgeBtnProps) => {
    let text = "Annul bet";
    if (winner) text = "Register Bettor " + winner + "'s win";

    return (
      <Button
        variant="contained"
        onClick={() => {
          props.onSubmit({
            betId: betInfo.betId,
            isJudge,
            winner,
          });
        }}
      >
        {text}
      </Button>
    );
  };

  let [isFetching, isRpcErr, isOtherErr, isFetched, isPending, isAdjudicated] =
    [false, false, false, false, false, false];

  const isJudge =
    props.state.address?.toLowerCase() === betInfo.judge.toLowerCase();
  const isBettor1 =
    props.state.address?.toLowerCase() === betInfo.bettor1.toLowerCase();
  const isBettor2 =
    props.state.address?.toLowerCase() === betInfo.bettor2.toLowerCase();

  if (betId >= 0)
    if (betInfo.error.status === RpcCallErrorStatus.UNDEFINED)
      isFetching = true;
    else if (betInfo.error.status === RpcCallErrorStatus.RECOGNIZED_RPC_ERROR)
      isRpcErr = true;
    else if (betInfo.error.status === RpcCallErrorStatus.OTHER_ERROR)
      isOtherErr = true;
    else {
      isFetched = true;
      isPending = betInfo.status === BetStatus.PENDING;
      isAdjudicated = [
        BetStatus.WON2,
        BetStatus.WON1,
        BetStatus.CLAIMED2,
        BetStatus.CLAIMED1,
        BetStatus.CANCELED,
        BetStatus.CLAIMED_REFUND1,
        BetStatus.CLAIMED_REFUND2,
        BetStatus.CLAIMED_REFUNDS,
      ].includes(betInfo.status);
    }

  return (
    <>
      {/* PITFALL - I tried having a local function SelectBet be defined above and return
    the below SelectBetForm component, so that I can use it here for readability, but
    this caused a problem: every time the interval triggered a new update, the form
    was rerendered completely and whatever was in the input box would disappear.
    So it looks like the rerender of the Header component (happening because the fetching 
    flag changed) caused the rerender of this component (because it's this 
    component's parent), which then caused that local function to be completely 
    rebuilt, which then caused the previous version of SelectBetForm to completely
    unmount and the new one to mount, and React wasn't able to see that they are the 
    same. Or something to that effect 
    */}
      <PageHeading text="Adjudications and Forfeitures"></PageHeading>
      <SelectBetForm
        isDisabled={!props.state.address}
        onSubmit={(vals) => {
          setBetId(+vals.betId);
          const func = async () => {
            const newBetInfo = await fetchBetInfo(
              +vals.betId,
              props.state.provider,
              props.state.contractAddress
            );
            // PITFALL - have to use the spread operator because otherwise it doesn't rerender
            // it looks like the above call always returns the same reference - that would explain
            // why React doesn't detect a state change if I don't use the spread operator
            setBetInfo({ ...newBetInfo });
          };
          func();
        }}
      />
      {isFetching && <StatusMsgNonHome txt="Fetching bet info..." />}
      {isRpcErr && (
        <StatusMsgNonHome txt="Status: Query error. Please check your bet id and try again" />
      )}
      {isOtherErr && (
        <StatusMsgNonHome txt="Could not fetch bet info. Please check your connection and try again" />
      )}
      {isFetched && (
        <>
          <StatusMsgNonHome txt={betStatusDescriptions[betInfo.status]} />
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            sx={{ gridColumnGap: "32px", padding: "16px 0" }}
          >
            <>
              {isPending && !isJudge && isBettor1 != isBettor2 && (
                <JudgeBtn isJudge={false} winner={isBettor1 ? 2 : 1} />
              )}
              {isPending && isJudge && (
                <>
                  <JudgeBtn isJudge={true} winner={1} />
                  <JudgeBtn isJudge={true} winner={2} />
                  <JudgeBtn isJudge={true} winner={0} />
                </>
              )}
              {(!isPending || (!isJudge && !isBettor1 && !isBettor2)) && (
                <Typography variant="button" sx={{ color: "error.main" }}>
                  YOU CANNOT ADJUDICATE THIS BET
                </Typography>
              )}
            </>
          </Stack>
          <Card
            elevation={3}
            sx={{
              padding: 2,
              margin: "auto",
              marginBottom: 1,
              marginTop: 1,
              maxWidth: "35rem",
            }}
          >
            <BetInformation betInfo={betInfo} />
          </Card>{" "}
          {/* <Typography
            variant={statusTypographyvariant}
            sx={{ color: "text.secondary" }}
          >
            Bettor 1: {`${betInfo.bettor1}`}
          </Typography>
          <Typography
            variant={statusTypographyvariant}
            sx={{ color: "text.secondary" }}
          >
            Bettor 2: {`${betInfo.bettor2}`}
          </Typography>
          <Typography
            variant={statusTypographyvariant}
            sx={{ color: "text.secondary" }}
            paragraph
          >
            Judge: &nbsp; &nbsp;{`${betInfo.judge}`}
          </Typography>
          <Typography
            variant={statusTypographyvariant}
            sx={{ color: "text.secondary" }}
          >
            Bettor 1's wager: {`${ethers.utils.formatEther(betInfo.amt1)} ETH`}
          </Typography>
          <Typography
            variant={statusTypographyvariant}
            sx={{ color: "text.secondary" }}
          >
            Bettor 2's wager: {`${ethers.utils.formatEther(betInfo.amt2)} ETH`}
          </Typography>{" "} */}
        </>
      )}
    </>
  );
};
