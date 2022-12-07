import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useLocalStorage } from "usehooks-ts";

import { useState } from "react";
import { welcomeMsgs } from "../constants";
import { Action, StateBundleT } from "../StateReducer";
import CustomTypographyList from "./CustomTypographyList";

export type WelcomeMsgPropsT = {
  /*open: boolean,
    setOpen: types.setStateT<boolean>,
    variant: "no metamask" | "normal"*/
  sstate: StateBundleT;
};

export function WelcomeMsg({ sstate }: WelcomeMsgPropsT) {
  const [nomore, setNomore] = useLocalStorage("betczar.nowelcome", false);
  const [nomoreChecked, setNomoreChecked] = useState(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNomoreChecked(event.target.checked);
  };
  const handleClose = () => {
    sstate.dispatch({ type: Action.WELCOME_MSG_DISMISSED });
    setNomore(nomoreChecked);
  };

  const lastParagraphInd = welcomeMsgs["normal"].length - 1;
  return (
    <>
      <Dialog
        fullWidth={false}
        sx={{ "& .MuiPaper-root": { borderRadius: "14px" } }}
        open={!nomore && sstate.val.welcomeState.includes("SHW")}
        onClose={handleClose}
      >
        <DialogTitle>Welcome to Bet Czar</DialogTitle>
        <DialogContent sx={{paddingBottom:"15px"}}>
          <DialogContentText component="div">
            {welcomeMsgs["normal"].map((paragraph, i) => (
              <CustomTypographyList
                key={i}
                parts={paragraph}
                isParagraph={i < lastParagraphInd}
              />
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{ width: "100%", justifyContent: "space-between", pl: 3, pr: 3 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={nomoreChecked}
                onChange={handleChange}
                inputProps={{ "aria-label": "no-more-welcome" }}
              />
            }
            label="Don't show again"
            labelPlacement="end"
          />
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
