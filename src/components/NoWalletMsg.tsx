import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { connectBtnMsgs } from "../constants";
import * as types from "../utils/type shorthands";
import CustomTypographyList from "./CustomTypographyList";

export type NoWalletMsgPropsT = {
  isOpen: boolean,
    setOpen: types.setStateT<boolean>,
};

export function NoWalletMsg({ isOpen, setOpen }: NoWalletMsgPropsT) {
  const handleClose = () => setOpen(false)
  const paragraphArray = connectBtnMsgs["nowallet"]
  const lastParagraphInd = paragraphArray.length - 1
  return (
    <>
      <Dialog
        fullWidth={false}
        sx={{"& .MuiPaper-root":{borderRadius:"14px"}}}
        open={isOpen}
        onClose={handleClose}
      >
        <DialogTitle>No Metamask on this browser</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            {paragraphArray.map((paragraph, i) => (
              <CustomTypographyList key={i} parts={paragraph} isParagraph={i < lastParagraphInd}/>
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
