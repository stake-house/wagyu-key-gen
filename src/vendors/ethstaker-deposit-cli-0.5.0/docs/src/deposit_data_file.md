# Deposit Data file

A deposit data file is created when calling the **[new-mnemonic](new_mnemonic.md)**, the **[existing-mnemonic](existing_mnemonic.md)** or the **[partial-deposit](partial_deposit.md)** command.

The deposit data file is a JSON file that contains a list of deposits that is mostly used for the [Ethereum Staking Launchpad](https://github.com/ethereum/staking-launchpad). It is loosly based on [the DepositData structure](https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md#depositdata) and the [deposit function](https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/deposit-contract.md#deposit-function) from the [deposit smart contract](https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/deposit-contract.md).

## Format
Each deposit from the list will contain this structure:
```JSON
{
    "pubkey": "string",
    "withdrawal_credentials": "string",
    "amount": "number",
    "signature": "string",
    "deposit_message_root": "string",
    "deposit_data_root": "string",
    "fork_version": "string",
    "network_name": "string",
    "deposit_cli_version": "string"
}
```

- **pubkey**: The validator public key value to be passed to the deposit function call.
- **withdrawal_credentials**: The withdrawal credentials value to be passed to the deposit function call.
- **amount**: The deposit amount to be sent with the call to the deposit function call. This should always be 32 Ethers (in GWEI, `32000000000`) when performing a deposit for a validator to be activated. The unit for this value is GWEI. For partial deposits, this value can be an integer value higher or equal than 1 and generally lower than or equal to 2048 in Ethers.
- **signature**: The signature value to be passed to the deposit function call.
- **deposit_message_root**: A deposit message root value used for validation by the Ethereum Staking Launchpad.
- **deposit_data_root**: The deposit data root value to be passed to the deposit function call.
- **fork_version**: The fork version of the network that this deposit file was created for.
- **network_name**: The network name of the network that this deposit file was created for.
- **deposit_cli_version**: The tool version used to create this file. We are currently faking this value to work around [an issue](https://github.com/eth-educators/ethstaker-deposit-cli/issues/216) with the Launchpad.

## Example
```JSON
[
  {
    "pubkey":"962195958e742b8dc5b2a25adede82fc5cd661827cb1e1237025e3d7847801aa5584d5bfdc6893413264cccfbff54128",
    "withdrawal_credentials":"0007a213a9a50ddf7e00e53267af1c131ed82fec947f1c9656b54f9a20f7a87f",
    "amount":32000000000,
    "signature":"a2d56afe4540d5b506aea614848a0838b66c8707a91aa73cdb0e7b59d819f16be64881b5b621184b1668f4f1d024094a1861c5af783ded675b5763047c069c5eb805649f7c04656c96b31b0bccc34ed93c8fcd8f2e4a9e5c03453f305089d765",
    "deposit_message_root":"f9bdb1e800b8f9f0db98c77271745e3c6140f18bf420543bda84fa92c393ddc7",
    "deposit_data_root":"7cda08cd57c303f8af720b10a0852408bc31e015cb552f0029fc1024b8a1d615",
    "fork_version":"01017000",
    "network_name":"holesky",
    "deposit_cli_version":"2.7.0"
  },
  {
    "pubkey":"86ee0b826d7d5262324ace2fba4ed5f09a1cbef80552e3d945279f19bc4118a98e9a93257eb4c7731ccc10c19835d24f",
    "withdrawal_credentials":"00daf39b8996943de9e93d417a6c5a4b958e4ae7a4d6e27f72aa08d41faa012f",
    "amount":32000000000,
    "signature":"83b227d72d9f1362d8676a61b91bb3882059e89c7d862d8030b1d37e890143869c105a78efce2a734f202da95076782219010e896ec9f8328a9e553134773626810d6c455bc1250a20e52a01684c051dd3e46151587267214cbb396673a13e89",
    "deposit_message_root":"99dbb2392fef277c15e710ca0ead058c024adce15f9e8f369bbaea939c0009ed",
    "deposit_data_root":"0fcb16fdb536b00a037a3ccde67187d21abfb726d677e40709ae6910d44377a5",
    "fork_version":"01017000",
    "network_name":"holesky",
    "deposit_cli_version":"2.7.0"
  }
]
```