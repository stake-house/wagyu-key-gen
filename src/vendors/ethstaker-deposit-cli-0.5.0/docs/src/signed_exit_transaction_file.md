# Signed Exit Transaction file

A signed exit transaction file is created when calling the **[exit-transaction-keystore](exit_transaction_keystore.md)** or the **[exit-transaction-mnemonic](exit_transaction_mnemonic.md)** command.

The signed exit transaction file is a JSON file. It contains a single message to exit a validator. The format of the signed exit transaction file is loosly based on the input for the POST `/eth/v1/beacon/pool/voluntary_exits` [API endpoint](https://ethereum.github.io/beacon-APIs/#/Beacon/submitPoolVoluntaryExit) as defined by [the Ethereum Beacon APIs](https://github.com/ethereum/beacon-APIs). Part of this content is based on the [SignedVoluntaryExit](https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md#signedvoluntaryexit) signed envelope as defined in the [Ethereum Consensus Specifications](https://github.com/ethereum/consensus-specs/).

## Broadcasting

If you have access to a beacon node client running on your target network, you can publish this message simply by calling the POST `/eth/v1/beacon/pool/voluntary_exits` [API endpoint](https://ethereum.github.io/beacon-APIs/#/Beacon/submitPoolVoluntaryExit) and passing the content of the signed exit transaction file as the payload. You can also use [the Beaconcha.in Broadcast Signed Messages tool](https://beaconcha.in/tools/broadcast) which might be easier for most users.

## Example
```JSON
{
  "message":{
    "epoch":"0",
    "validator_index":"1804776"
  },
  "signature":"0x97fa465cf1081755002e35fab245bd2872381b07cbfa4df245a13e3834aba83a347f5c2a36a34760e9fcc754dd862de700d103b1cb0d5d9ce293242ebf9ad44a6073e5c4794424428a8f983513d88e6ff6ddccbde7b3e0ea43554a0b856f3199"
}
```