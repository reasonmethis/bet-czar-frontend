// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
export const supportedNetworks = [
    /*{
        name: "Sepolia",
        id: "1115511"
    },*/
    {
        name: "Goerli",
        id: "5",
        contractAddress: "0x497ff2D9CC6674b64e1619c87468EFE8692F0353"
    },
    {
        name: "Localhost: 8545",
        id: "1337",
        contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    },
]

export const DT_POLLING_IN_MS = 20000;
export const DUR_SNACKBAR = 15000;

export const txCodes = [
    {code: "ACTION_REJECTED", userMsg: "Tx rejected by user", level:"info"},
    {code: "INSUFFICIENT_FUNDS", userMsg: "Insufficient balance for tx", level:"error"},
    {code: "ACTION_REJECTED", userMsg: "Tx rejected by user", level:"info"},
]

