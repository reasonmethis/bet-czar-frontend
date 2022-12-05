import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ethers } from "ethers";
import { statusTypographyvariant } from "../constants";
import { BetInfoT } from "./interfaces";

import BalanceIcon from "@mui/icons-material/Balance";
import PersonIcon from "@mui/icons-material/Person";
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

type BetInformationPropsT = {
  betInfo: BetInfoT;
};
function BetInformation({ betInfo }: BetInformationPropsT) {
  return (
    <>
      {/* {betInfo.status === BetStatus.UNKNOWN ? (
        <Typography variant={statusTypographyvariant}>
          Status: Fetching...
        </Typography>
      ) : (
        <Typography variant={statusTypographyvariant}>
          Status: {betStatusDescriptions[betInfo.status]}
        </Typography>
      )} */}
      <Stack direction="row" gap={1}>
        <PersonIcon fontSize="small"/>
        <Typography
          variant={statusTypographyvariant}
          sx={{ color: "text.secondary" }}
        >
          Bettor 1: {`${betInfo.bettor1}`}
        </Typography>
      </Stack>
      <Stack direction="row" gap={1}>
        <PersonIcon fontSize="small"/>
        <Typography
          variant={statusTypographyvariant}
          sx={{ color: "text.secondary" }}
        >
          Bettor 2: {`${betInfo.bettor2}`}
        </Typography>
      </Stack>
      <Stack direction="row" gap={1}>
        <BalanceIcon color="inherit" fontSize="small"/>
        <Typography
          variant={statusTypographyvariant}
          sx={{ color: "text.secondary" }}
          paragraph
        >
          Judge: &nbsp; &nbsp;{`${betInfo.judge}`}
        </Typography>
      </Stack>
      <Stack direction="row" gap={1}>
      <RequestQuoteIcon fontSize="small"/>

      <Typography
        variant={statusTypographyvariant}
        sx={{ color: "text.secondary" }}
      >
        Bettor 1's wager: {`${ethers.utils.formatEther(betInfo.amt1)} ETH`}
      </Typography></Stack>
      <Stack direction="row" gap={1}>
        <RequestQuoteIcon fontSize="small"/>
      <Typography
        variant={statusTypographyvariant}
        sx={{ color: "text.secondary" }}
      >
        Bettor 2's wager: {`${ethers.utils.formatEther(betInfo.amt2)} ETH`}
      </Typography></Stack>
    </>
  );
}

export default BetInformation;
