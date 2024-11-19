# Keystore file

A keystore file is created when calling the **[new-mnemonic](new_mnemonic.md)** or the **[existing-mnemonic](existing_mnemonic.md)** command.

The format of the keystore file is defined in the [ERC-2335: BLS12-381 Keystore](https://eips.ethereum.org/EIPS/eip-2335) document.

In the context of staking on the Ethereum blockchain, the keystore file is used to store the validator signing key and transport it across devices while being protected with a password. Once created by a tool such as ethstaker-deposit-cli, it will generally be copied on a device running a validator client to be imported by that validator client with the associated password. Once the validator signing key is available to the validator client, it generally provides all the secrets needed to perform the associated validator's duties.