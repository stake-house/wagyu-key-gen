# generate-bls-to-execution-change

{{#include ./snippet/warning_message.md}}

## Description
Generates a BLS to execution address change message. This is used to add a withdrawal address to a validator that does not currently have one.

## Optional Arguments

- **`--bls_to_execution_changes_folder`**: The path to store the change JSON file.

- **`--chain`**: The chain to use for generating the deposit data. Options are: 'mainnet', 'sepolia', 'holesky', 'mekong', or 'ephemery'.

- **`--mnemonic`**: The mnemonic you used to create withdrawal credentials. <span class="warning"></span>

- **`--mnemonic_language`**: The language of your mnemonic. If this is not provided we will attempt to determine it based on the mnemonic.

- **`--mnemonic_password`**: The mnemonic password you used in your key generation. Note: It's not the keystore password. <span class="warning"></span>

- **`--validator_start_index`**: The index position for the keys to start generating withdrawal credentials for.

- **`--validator_indices`**: A list of the chosen validator index number(s) as identified on the beacon chain. Split multiple items with whitespaces or commas.

- **`--bls_withdrawal_credentials_list`**: A list of the old BLS withdrawal credentials of the given validator(s). It is for confirming you are using the correct keys. Split multiple items with whitespaces or commas.

- **`--withdrawal_address`**: The Ethereum address that will be used in withdrawal. It typically starts with '0x' followed by 40 hexadecimal characters. Please make sure you have full control over the address you choose here. Once you set a withdrawal address on chain, it cannot be changed.

- **`--devnet_chain_setting`**: The custom chain setting of a devnet or testnet. Note that it will override your `--chain` choice. This should be a JSON string containing an object with the following keys: network_name, genesis_fork_version, exit_fork_version and genesis_validator_root.

## Output files
A successful call to this command will result in one [BLS to Execution Change file](bls_to_execution_change_file.md) created.

## Example Usage

```sh
./deposit generate-bls-to-execution-change
```
