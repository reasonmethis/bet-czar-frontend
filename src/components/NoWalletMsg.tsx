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
  return (
    <>
      <Dialog
        fullWidth={false}
        //maxWidth={maxWidth}
        open={isOpen}
        onClose={handleClose}
      >
        <DialogTitle>No Metamask on this browser</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            {connectBtnMsgs["nowallet"].map((paragraph, i) => (
              <CustomTypographyList key={i} parts={paragraph} />
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
