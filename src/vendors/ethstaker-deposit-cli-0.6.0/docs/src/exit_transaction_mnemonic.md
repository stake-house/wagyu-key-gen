# exit-transaction-mnemonic

{{#include ./snippet/warning_message.md}}

## Description
Creates an exit transaction using a mnemonic phrase.

## Optional Arguments

- **`--chain`**: The chain to use for generating the deposit data. Options are: 'mainnet', 'sepolia', 'holesky', 'mekong', or 'ephemery'.

- **`--mnemonic`**: The mnemonic you used during key generation. <span class="warning"></span>

- **`--mnemonic_language`**: The language of your mnemonic. If this is not provided we will attempt to determine it based on the mnemonic.

- **`--mnemonic_password`**: The mnemonic password you used in your key generation. Note: It's not the keystore password. <span class="warning"></span>

- **`--validator_start_index`**: The index position for the keys to start generating keystores in [ERC-2334 format](https://eips.ethereum.org/EIPS/eip-2334#eth2-specific-parameters) format.

- **`--validator_indices`**: A list of the chosen validator index number(s) as identified on the beacon chain. Split multiple items with whitespaces or commas.

- **`--epoch`**: The epoch of when the exit transaction will be valid. The transaction will always be valid by default.

- **`--output_folder`**: The folder path for the `signed_exit_transaction-*` JSON file.

- **`--devnet_chain_setting`**: The custom chain setting of a devnet or testnet. Note that it will override your `--chain` choice. This should be a JSON string containing an object with the following keys: network_name, genesis_fork_version, exit_fork_version and genesis_validator_root.

## Output files
A successful call to this command will result in one or more [Signed Exit Transaction files](signed_exit_transaction_file.md) created.

## Example Usage

```sh
./deposit exit-transaction-mnemonic
```
