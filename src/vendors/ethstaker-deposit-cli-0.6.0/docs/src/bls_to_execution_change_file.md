# BLS to Execution Change file

A BLS to execution change file is created when calling the **[generate-bls-to-execution-change](generate_bls_to_execution_change.md)** command.

The BLS to execution change file is a JSON file. It contains a list of messages to change the withdrawal credentials for one or many validators. The format of the BLS to execution change file is loosely based on the input for the POST `/eth/v1/beacon/pool/bls_to_execution_changes` [API endpoint](https://ethereum.github.io/beacon-APIs/#/Beacon/submitPoolBLSToExecutionChange) as defined by [the Ethereum Beacon APIs](https://github.com/ethereum/beacon-APIs). Part of this content is based on the [SignedBLSToExecutionChange](https://github.com/ethereum/consensus-specs/blob/dev/specs/capella/beacon-chain.md#signedblstoexecutionchange) container as defined in the [Ethereum Consensus Specifications](https://github.com/ethereum/consensus-specs/).

## Broadcasting

If you have access to a beacon node client running on your target network, you can publish these messages simply by calling the POST `/eth/v1/beacon/pool/bls_to_execution_changes` [API endpoint](https://ethereum.github.io/beacon-APIs/#/Beacon/submitPoolBLSToExecutionChange) and passing the content of the BLS to execution change file as the payload. You can also use [the Beaconcha.in Broadcast Signed Messages tool](https://beaconcha.in/tools/broadcast) which might be easier for most users.

## Example
```JSON
[
  {
    "message":{
      "validator_index":"1804776",
      "from_bls_pubkey":"0x970245df5f9cf7a082db195136a3066412b62e8bf04e21d7c3408d7fb36f34f20c4cb0883e798b82523b466f7a61c838",
      "to_execution_address":"0x4d496ccc28058b1d74b7a19541663e21154f9c84"
    },
    "signature":"0xa1e47e6b1fdf4dd5f1dd3ddb3d47d2dcf446d096d49d90afef06a38dc02fba6b4d16d1dc1184c791e54666dabb8bdedd0660bc9bb3bc5d0e592eaf5f0c978cca4fcafe4037672940d6f1a44d2a33503c30cb98ca695979b1de9e321a8a694bc2",
    "metadata":{
      "network_name":"holesky",
      "genesis_validators_root":"0x9143aa7c615a7f7115e2b6aac319c03529df8242ae705fba9df39b79c59fa8b1",
      "deposit_cli_version":"0.1.4-dev"
    }
  }
]
```
