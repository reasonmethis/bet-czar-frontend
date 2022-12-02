const BASE_ROUTE = "betczar_frontend";
export const ROUTE_PREFIX = "/" + BASE_ROUTE;
export const MAIN_ROUTE = BASE_ROUTE ? BASE_ROUTE : "/";
export const navigationLinks = [
  { name: "Home", href: ROUTE_PREFIX },
  { name: "New", href: ROUTE_PREFIX + "/newbet" },
  { name: "Deposit", href: ROUTE_PREFIX + "/deposit" },
  { name: "Withdraw", href: ROUTE_PREFIX + "/withdraw" },
  { name: "Judge", href: ROUTE_PREFIX + "/judge" },
];
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
    contractAddress: "0x497ff2D9CC6674b64e1619c87468EFE8692F0353",
  },
  {
    name: "Localhost: 8545",
    id: "1337",
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
];

export const DT_POLLING_IN_MS = 20000;
export const DUR_SNACKBAR = 15000;

export const txCodes = [
  { code: "ACTION_REJECTED", userMsg: "Tx rejected by user", level: "info" },
  {
    code: "INSUFFICIENT_FUNDS",
    userMsg: "Insufficient balance for tx",
    level: "error",
  },
  { code: "NETWORK_ERROR", userMsg: "Network is not responding to requests", level: "error" },
];

export const welcomeMsgs = {
  normal: [
    [
      "P:What is it?",
      "N: Bet Czar is a decentralized App to create and enforce any bets between two parties.",
    ],
    [
      "P:Toy example: ",
      "N: say you bet your friend Bob $100 that you can teach your cat to do a somersault in two weeks. Unfortunately Bob is flaky, so you need some way to make sure he will pay up. You can then use Bet Czar to create a bet enforced by a smart contract.",
    ],
    [
      "P:How would that work?",
      "N: You both deposit your wagers into escrow and designate your other friend Judy to be the judge - in case you and Bob can't agree who won. The winner can withdraw the whole amount  whenever (a) one of you concedes defeat OR (b) Judy designates the winner (or calls a tie).",
    ],
    [
      "P:Can Bet Czar steal our money? ",
      'N: No, the contract is built with no "superuser", only the bet participants can withdraw the money in the escrow. The contract code can be examined, it is verified on Etherscan. ',
    ],
  ],
};

export const connectBtnMsgs = {
  nowallet: [
    //["N: You need the Metamask wallet to create and manage Bets."],
    [
      "P: What is that?",
      "N: Metamask is by far the most widely used crypto wallet to interact with decentralized Apps like this one. It serves as the middleman between you and the App, so that you can authorize transactions without telling the App your private information.",
    ],
    [
      "P:How do I get it?",
      "N: You can find it in the Chrome extension store. You can then add it to your Chrome, Firefox, or Brave browser.",
    ],
    [
      "P: And then?",
      'N: If you are new to crypto this might seem a bit overwhelming, but it\'s actually not so bad: the next step would be to get some free "fake" ETH from a Goerli faucet and you will be ready to fully test out this App.',
    ],
    [
      "P:Can I still explore it without Metamask?",
      "N: You can still see the various pages and get a rough sense of their functionality. But without a connection to the blockchain, you won't be able to see how to interact with Bets."
      //"N: Yes, but you won't be able to create and manage Bets. You can still query the status of others' Bets on Goerli (it's a test network for Ethereum). To do that, wherever it asks for a Bet id, just enter 0, 1, or 2.",
    ],
  ],
};
//test_addr_with_bets_on_goerli_network_TEST
export const TEST_ADDR = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"//"0x1111111111111111111111111111111111111111";
export const TEST_NETWORK_ID = "5";
export const TEST_NETWORK_NAME = "goerli"
export const TEST_RPC = "https://eth-goerli.g.alchemy.com/v2/demo"
//"https://goerli.infura.io/v3/"; //says can't detect network
