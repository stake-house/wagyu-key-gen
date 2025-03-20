# BLS to Execution Change Keystore file

A BLS to execution change keystore file is created when calling the **[generate-bls-to-execution-change-keystore](generate_bls_to_execution_change_keystore.md)** command.

The BLS to execution change keystore file is a JSON file. The format is very similar to the [BLS to execution change file](bls_to_execution_change_file.md) but with the `from_bls_pubkey` and `metadata` attributes removed.

## Utilizing

There is currently no integration with this file format with either the execution layer or beacon chain. The `signature` value must be provided as the `keystore_signature` for the [Signature file](https://github.com/eth-educators/update-credentials-without-mnemonic#signature-file-format).

## Example
```JSON
{
  "message":{
    "validator_index":"1804776",
    "to_execution_address":"0x4d496ccc28058b1d74b7a19541663e21154f9c84"
  },
  "signature":"0xa1e47e6b1fdf4dd5f1dd3ddb3d47d2dcf446d096d49d90afef06a38dc02fba6b4d16d1dc1184c791e54666dabb8bdedd0660bc9bb3bc5d0e592eaf5f0c978cca4fcafe4037672940d6f1a44d2a33503c30cb98ca695979b1de9e321a8a694bc2",
}
```
