import { BigNumber, ethers } from "ethers";
import { useState } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Card, Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";

import BarChartIcon from "@mui/icons-material/BarChart";

import { StateBundleT } from "../StateReducer";

import BetInformation from "./BetInformation";
import { BetInfoT, BetStatus, betStatusDescriptions } from "./interfaces";
import { PageHeading } from "./PageHeading";
import { WelcomeMsg } from "./WelcomeMsg";

interface HomeLoaderData {
  date: string;
}

export async function homeLoader(): Promise<HomeLoaderData> {
  //await sleep(1000); //hm, causes ugly rerender
  return {
    date: new Date().toISOString(),
  };
}
type OneBetPropsT = {
  //event: ethers.Event;
  betInfo: BetInfoT;
};
type BetListPropsT = {
  //events: ethers.Event[];
  betInfos: BetInfoT[];
};

type HomePropsT = {
  sstate: StateBundleT;
};

const OneBet = ({ betInfo }: OneBetPropsT) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (
    changeEvent: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded);
  };
  //if (!event.args!) return <div>Corrupted bet</div>;

  const totalWagers = ethers.utils.formatEther(
    BigNumber.from(betInfo.amt1).add(BigNumber.from(betInfo.amt2))
  );
  return (
    <Card
      elevation={2}
      sx={{  marginBottom: "6px", maxWidth: "35rem" }}
    >
      <Accordion expanded={expanded} onChange={handleChange}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="bet-content"
          id="bet-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>
            Bet Id: {`${betInfo.betId}`}
          </Typography>
          {/* <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Total wagers {totalWagers} ETH
          </Typography> */}
          {betInfo.status === BetStatus.UNKNOWN ? (
            <></>
          ) : (
            <>
              <BarChartIcon sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ pt: "0.2rem" }}>
                {betStatusDescriptions[betInfo.status]}
              </Typography>
            </>
          )}
        </AccordionSummary>
        <AccordionDetails>
          <BetInformation betInfo={betInfo} />
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

const BetList = ({ betInfos }: BetListPropsT) => {
  return betInfos.length === 0 ? (
    <>
      <Typography variant="body2" color="text.secondary">
        No bets in this category
      </Typography>
      <Box sx={{ marginBottom: "8px" }}></Box>
    </>
  ) : (
    <>
      {betInfos.map((betInfo) => (
        <OneBet key={betInfo.betId} betInfo={betInfo}></OneBet>
      ))}
      <Box sx={{ marginBottom: "8px" }}></Box>
    </>
  );
};

export const Home = ({ sstate }: HomePropsT) => {
  //let data = useLoaderData() as HomeLoaderData;
  const state = sstate.val;
  const betInfosForRoles: BetInfoT[][] = [[], [], []];

  if (state.address && state.allBets) {
    state.allBets.betIdsForRoles.forEach((betIds, roleIndex) => {
      //for each of the three roles we have a list betIds, from which we will
      //make a list of betInfos
      betInfosForRoles[roleIndex] = betIds.map(
        (id) => state.allBets!.betInfoMap.get(id)!
      );
    });
  }

  return (
    <>
      <WelcomeMsg sstate={sstate}></WelcomeMsg>
      <PageHeading text="Dashboard"></PageHeading>
      {!state.address ? (
        <Typography variant="subtitle1" color="text.secondary">
          Once you are connected, you will see all of your bets here.
        </Typography>
      ) : (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Bets where you are Bettor 1
          </Typography>
          {state.allBets === undefined ? (
            <Typography variant="body2" color="text.secondary">
              Fetching...
            </Typography>
          ) : (
            <BetList betInfos={betInfosForRoles[0]}></BetList>
          )}

          <Typography variant="subtitle1" gutterBottom>
            Bets where you are Bettor 2
          </Typography>
          {state.allBets === undefined ? (
            <Typography variant="body2" color="text.secondary">
              Fetching...
            </Typography>
          ) : (
            <BetList betInfos={betInfosForRoles[1]}></BetList>
          )}

          <Typography variant="subtitle1" gutterBottom>
            Bets where you are Judge
          </Typography>
          {state.allBets === undefined ? (
            <Typography variant="body2" color="text.secondary">
              Fetching...
            </Typography>
          ) : (
            <BetList betInfos={betInfosForRoles[2]}></BetList>
          )}
        </>
      )}
      {/* <p>Last loaded at: {data.date}</p> */}
    </>
  );
};
