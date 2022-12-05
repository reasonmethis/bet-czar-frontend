import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import logoImg from "../logo.svg";
import handwrittenImg from "../Bet Czar handwritten transparent bg.png";

// https://github.com/pheezx/Gatsby-Portfolio/blob/master/src/components/Header.jsx
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaidIcon from '@mui/icons-material/Paid';

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Hidden from "@mui/material/Hidden";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
//import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Toolbar from "@mui/material/Toolbar";

import { styled } from "@mui/material/styles"; //VS code suggests from "@mui/material" but
//I am following docs: https://mui.com/material-ui/customization/how-to-customize/

import { useLocalStorage } from "usehooks-ts";
import { navigationLinks } from "../constants";
import { IState } from "../StateReducer";
import { roundAmt, shortenHash } from "../utils/utils";
import { NoWalletMsg } from "./NoWalletMsg";

//locked 8fc9f8, 5a7da3:  185, 95, 137 b95f89 84a98c ef798a
//locked 90caf9, 121212: f87575 ed254e de3c4b 990033
const darkTheme = createTheme({
  palette: { mode: "dark", secondary: { main: "#ff499e" }, error: {main: "#880044"} },
});
const lightTheme = createTheme({
  palette: { mode: "light", secondary: { main: "#ff499e" }, error: {main: "#880044"} },
});
/*
const customLightTheme = createTheme({
  palette: {
    mode: "light",
    appbar: {
      main: "#121212",
      contrastText: "#fff"
    }
  },
});*/

const StyledLink = styled(Link)(({ theme }) => ({
  marginRight: 20,
  //underline: "none",
  textDecoration: "none",
  color: `${theme.palette.text.primary}`, //`${theme.palette.primary.main}`
}));

type HeaderPropsT = {
  state: IState;
  connectWallet: (isFake: boolean) => Promise<void>;
};

export default function NavNormalAndHamburger({
  state,
  connectWallet,
}: HeaderPropsT) {
  const [open, setOpen] = useState(false);
  const [noWalletMsgOpen, setNoWalletMsgOpen] = useState(false);
  const location = useLocation();
  //console.log(location.pathname)
  const [themeName, setThemeName] = useLocalStorage("betczar.theme", "light");
  const theme = themeName === "light" ? lightTheme : darkTheme;

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ThemeProvider theme={darkTheme}>
          <AppBar position="sticky" color="default">
            <Container maxWidth="md">
              <Toolbar disableGutters sx={{ minHeight: "48px !important" }}>
                <Avatar src={logoImg} sx={{ mr: "16px" }}></Avatar>
                {/* <img src={handwrittenImg} marginRight={"auto"}></img> */}
                {/* <Box
                  component="img"
                  sx={{
                    height: 24,
                    mr:"auto"
                  }}
                  alt="Bet Czar text logo"
                  src={handwrittenImg}
                /> */}
                <Typography variant="h6" component="span" fontWeight="100" color="secondary" >Bet</Typography>
                <Typography variant="h6" component="span" fontWeight="900" color="secondary" marginRight="auto">Czar</Typography>
                <Hidden smDown>
                  {navigationLinks.map((item) =>
                    item.href === location.pathname ? (
                      <StyledLink
                        to={item.href}
                        key={item.name}
                        sx={{
                          borderBottom:
                            "solid 3px " + theme.palette.secondary.main,
                          marginTop: "3px",
                        }}
                      >
                        {item.name}
                      </StyledLink>
                    ) : (
                      <StyledLink to={item.href} key={item.name}>
                        {item.name}
                      </StyledLink>
                    )
                  )}
                </Hidden>
                <Hidden smUp>
                  <IconButton onClick={() => setOpen(true)}>
                    <MenuIcon />
                  </IconButton>
                </Hidden>
              </Toolbar>
            </Container>
            <SwipeableDrawer
              anchor="right"
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
            >
              <div
                onClick={() => setOpen(false)}
                onKeyPress={() => setOpen(false)}
                role="button"
                tabIndex={0}
              >
                <IconButton>
                  <ChevronRightIcon />
                </IconButton>
              </div>
              <Divider />
              <List>
                {navigationLinks.map((item) => (
                  <ListItem key={item.name}>
                    {item.href === location.pathname ? (
                      <StyledLink
                        to={item.href}
                        sx={{
                          borderBottom:
                            "solid 3px " + theme.palette.secondary.main,
                        }}
                      >
                        {item.name}
                      </StyledLink>
                    ) : (
                      <StyledLink to={item.href} key={item.name}>
                        {item.name}
                      </StyledLink>
                    )}
                  </ListItem>
                ))}
              </List>
            </SwipeableDrawer>
          </AppBar>
        </ThemeProvider>

        <Container maxWidth="md" sx={{ marginTop: "16px" }}>
          {state.address ? (
            <Box marginBottom="16px" >
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <AccountBalanceWalletIcon/>
              <Typography variant="subtitle1">
                {shortenHash(state.address)}
              </Typography>
              <PaidIcon/>
              {/* <Typography variant="body2" color="text.secondary"> */}
              <Typography variant="subtitle1" color="text.primary">
                {state.balance === undefined
                  ? "Fetching..."
                  : roundAmt(state.balance, 4) + " ETH"}
              </Typography></Stack>
            </Box>
          ) : (
            <Box marginBottom="16px">
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <AccountBalanceWalletIcon/>
              {/* <Typography variant="subtitle1" sx={{ paddingBottom: "8px" }}>
                Please connect your wallet to create and manage Bets */}
                <Typography variant="subtitle1" >
                  Wallet not connected
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  //connectWallet takes isFake param, if it's false connect normally
                  //if it's true, connect without metamask with a fake address
                  if ((window as any).ethereum) connectWallet(false);
                  else {
                    setNoWalletMsgOpen(true);
                    connectWallet(true);
                  }
                }}
              >
                Connect
              </Button>
              <NoWalletMsg
                isOpen={noWalletMsgOpen}
                setOpen={setNoWalletMsgOpen}
              />
              </Stack>
            </Box>
          )}
          <Outlet />
        </Container>
      </ThemeProvider>
    </>
  );
}
