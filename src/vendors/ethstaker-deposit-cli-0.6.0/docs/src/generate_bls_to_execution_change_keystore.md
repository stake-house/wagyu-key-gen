# generate-bls-to-execution-change-keystore

<div class="warning">
This command is associated with the a proposed solution to update withdrawal credentials for those who are missing their mnemonic. At this point this has not been approved or implemented and there is no guarantee credentials will be modified in the future.

The project is located [here](https://github.com/eth-educators/update-credentials-without-mnemonic) if you would like to learn more.
</div>

## Description
Signs a withdrawal credential update message using the provided keystore. This signature is one of the required proofs of ownership for validators who have lost or are missing their mnemonic and are unable to perform the BLS change needed to update their withdrawal credentials.

## Optional Arguments

- **`--chain`**: The chain to use for generating the deposit data. Options are: 'mainnet', 'sepolia', 'holesky', 'mekong', or 'ephemery'.

- **`--keystore`**: The keystore file associating with the validator you wish to sign with. This keystore file should match the provided validator index.

- **`--keystore_password`**: The password that is used to encrypt the provided keystore. Note: It's not your mnemonic password. <span class="warning"></span>

- **`--validator_index`**: The validator index corresponding to the provided keystore.

- **`--withdrawal_address`**: The Ethereum address that will be used in withdrawal. It typically starts with '0x' followed by 40 hexadecimal characters. Please make sure you have full control over the address you choose here. Once you set a withdrawal address on chain, it cannot be changed.

- **`--output_folder`**: The folder path for the `bls_to_execution_change_keystore_signature-*` JSON file.

- **`--devnet_chain_setting`**: The custom chain setting of a devnet or testnet. Note that it will override your `--chain` choice. This should be a JSON string containing an object with the following keys: network_name, genesis_fork_version, exit_fork_version and genesis_validator_root.

## Output files
A successful call to this command will result in one [BLS to Execution Change Keystore file](bls_to_execution_change_keystore_file.md) created.

## Example Usage

```sh
./deposit generate-bls-to-execution-change-keystore
```
