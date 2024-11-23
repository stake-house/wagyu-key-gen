# exit-transaction-keystore

{{#include ./snippet/warning_message.md}}

## Description
Creates an exit transaction using a keystore file.

## Optional Arguments

- **`--chain`**: The chain to use for generating the deposit data. Options are: 'mainnet', 'sepolia', 'holesky', 'mekong', or 'ephemery'.

- **`--keystore`**: The keystore file associating with the validator you wish to exit.

- **`--keystore_password`**: The password that is used to encrypt the provided keystore. Note: It's not your mnemonic password. <span class="warning"></span>

- **`--validator_index`**: The validator index corresponding to the provided keystore.

- **`--epoch`**: The epoch of when the exit transaction will be valid. The transaction will always be valid by default.

- **`--output_folder`**: The folder path for the `signed_exit_transaction-*` JSON file.

- **`--devnet_chain_setting`**: The custom chain setting of a devnet or testnet. Note that it will override your `--chain` choice. This should be a JSON string containing an object with the following keys: network_name, genesis_fork_version, exit_fork_version and genesis_validator_root.

## Output files
A successful call to this command will result in one [Signed Exit Transaction file](signed_exit_transaction_file.md) created.

## Example Usage

```sh
./deposit exit-transaction-keystore --keystore /path/to/keystore.json
```
