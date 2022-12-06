# Bet Czar

What is it? Bet Czar is a decentralized application (dapp), it uses the blockchain to create and enforce any bets between two parties. You can view a [working demo].

## Gentle Introduction 

**What kind of bets are we talking about?** Essentially any kind. Here's a toy example: say you bet your friend Bob $100 that you can teach your cat to do a somersault in two weeks. Unfortunately Bob is flaky, so you need some way to make sure he will pay up. You can then use Bet Czar to create a bet enforced by a smart contract.

**How would that work?** You both deposit your wagers into escrow and designate your other friend Judy to be the judge - in case you and Bob can't agree who won. The winner can withdraw the whole amount whenever (a) one of you concedes defeat OR (b) Judy designates the winner (or calls a tie). 

**Can Bet Czar steal our money?** No, the contract is built with no "superuser", only the bet participants can withdraw the money in the escrow. Unlike some well-known recent cases (ahem... FTX), the contract doesn't allow for users' deposits to be lent out or used for anything else. The funds just sit there, waiting for the winner to be registered, at which point they automatically become available for withdrawal by the winner. 

This next bit is a tad too technical for the gentle introduction but important for completeness: the contract code can be examined, it is [verified](https://goerli.etherscan.io/address/0x497ff2D9CC6674b64e1619c87468EFE8692F0353#code) on Etherscan. As with any dapp, when you use it, your wallet will show you which contract you are interacting with, so you can double check it's the right one.

## How Bets Work Exactly 

An unlimited number of Bets can be created. Each Bet is distinguished by a unique Bet Id and represents a wager between two parties. 

### Creating a new Bet

Anyone can create a Bet, it doesn't have to be one of the bettors (if the bettors don't actually agree to the terms, they simply won't deposit). To create a Bet, one must specify:

* The addresses of the two bettors
* The address of the judge
* The amounts each bettor must deposit if they in fact want to make this bet

### Activating a Bet

After that, a deposit must be made on behalf of each bettor in order for the Bet to become active. Normally, each bettor would make their own deposit, but that's not a requirement, anyone can deposit on their behalf. 

If only one bettor's deposit is made, the Bet is still not active and that bettor is free to recall their deposit. After both deposits are made, the Bet activates and the funds can only be disbursed after the outcome of the Bet is decided.

### Deciding the outcome 

There are two ways a Bet can end:

* If the bettors agree on who won, the losing bettor can register the other one as the winner.

* In case the bettors can't agree on who won, the judge can decide among the following outcomes: Bettor 1 wins, Bettor 2 wins, or neither. 

Once the outcome is decided, all funds automatically become available for withdrawal.

### Withdrawing funds

If a winner was registered, the winner can withdraw the total amount of both wagers. If the judge declared that neither bettor one (i.e. annulled the Bet), then each bettor can withdraw their own deposit.

Finally, as we mentioned before, the Bet only activates once both deposits are made. Until then, if only one person made a deposit, then the deposited funds are not locked and the bettor can withdraw them. 

## Using the Front-end.

Currently the [working demo] is deployed on the Ethereum testnet Goerli, so you can test it out without using any real money. To use it, you will need the Metamask wallet and some free test tokens. Follow these steps and you will be ready to go in no time:

1. If you don't have the Metamask wallet, [install it](https://metamask.io). Typically people install it as a Chrome extension, but it's available for all major browsers. Metamask will then walk you through creating your wallet address. I found a short [Youtube video](https://www.youtube.com/watch?v=ucOY4qkxfRE) that shows this step, as well as the next two steps.

2. Connect Metamask to the Goerli testnet (in case you are new to Metamask refer to the video linked above or follow [this guide](https://blog.cryptostars.is/goerli-g%C3%B6rli-testnet-network-to-metamask-and-receiving-test-ethereum-in-less-than-2-min-de13e6fe5677)). You can now click the Connect button in [Bet Czar][1].

3. Your balance probably 0. Then it's time to get yourself some free test ETH tokens. You can quickly collect 0.01ETH or so from the [Goerli POW faucet](https://goerli-faucet.pk910.de/) (there are other commonly used faucets but they require you to make a Twitter post or sign up for an Alchemy account).

You are now able to fully explore the full functionality of Bet Czar!

[working demo]: https://reasonmethis.github.io/betczar_frontend
[1]: https://reasonmethis.github.io/betczar_frontend
