# Quick Setup

This guide will walk you through the steps to download and set up the `ethstaker-deposit-cli` for your operating system.

**Build requirements**

- [Python **3.9+**](https://www.python.org/about/gettingstarted/)
- [pip3](https://pip.pypa.io/en/stable/installing/)

## Step 1: Download the Latest Release

### Download binary executable file

1. Navigate to the [Releases page](https://github.com/eth-educators/ethstaker-deposit-cli/releases) of the `ethstaker-deposit-cli` repository.

2. Download the corresponding file for your operating system:
    - **Windows**: Look for a file with `windows` in the name.
    - **MacOS**: Look for a file with `darwin` in the name.
    - **Linux**: Look for a file with `linux` in the name.

3. Extract the contents of the zipped file

4. Open a terminal or command prompt and navigate to the extracted folder

For other installation options, including building with python or virtualenv and docker image instructions, go [here](other_install_options.md)


## Step 2: Verify the Installation

1. Make sure you have [the GitHub CLI installed](https://cli.github.com/).

2. Verify the attestation against the corresponding file but be sure to replace the contents with the exact file name:
```sh
gh attestation verify ethstaker_deposit-cli-*******-***.*** --repo eth-educators/ethstaker-deposit-cli
```

This step requires you to be online. If you want to perform this offline, follow [these instructions from GitHub](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/verifying-attestations-offline).

3. You should see `✓ Verification succeeded!` in the output **otherwise do not continue**.

## Step 3: Usage

**Windows users:** You should replace `./deposit` with `deposit.exe` to run properly.

**MacOS users:** In order to run from the terminal, you must first open the file to bypass MacOS code signing issues. Do so by right-clicking the `deposit` file and then selecting `Open`.

**Linux users:** On Unix-based systems, keystores and the deposit_data*.json have 440/-r--r----- file permissions (user & group read only). This improves security by limiting which users and processes that have access to these files. If you are getting permission denied errors when handling your keystores, consider changing which user/group owns the file (with chown) or, if need be, change the file permissions with chmod.

Determine which command best suits what you would like to accomplish:

- **[new-mnemonic](new_mnemonic.md)**: Used to generate a new mnemonic, validator keys, and deposit file. It is not recommended to use this command if you have existing validators.

- **[existing-mnemonic](existing_mnemonic.md)**: Provide a mnemonic to regenerate validator keys or create new ones.

- **[generate-bls-to-execution-change](generate_bls_to_execution_change.md)**: Update your withdrawal credentials of existing validators. It is **required** to have the corresponding mnemonic.

- **[generate-bls-to-execution-change-keystore](generate_bls_to_execution_change_keystore.md)**: Sign an update withdrawal credentials message using your validator keystore.

- **[exit-transaction-keystore](exit_transaction_keystore.md)**: Generate an exit message using the keystore of your validators.

- **[exit-transaction-mnemonic](exit_transaction_mnemonic.md)**: Generate an exit message using the mnemonic of your validators.

- **[partial-deposit](partial_deposit.md)**: Generate a partial deposit using a validator keystore.

---

If you encounter any issues, please check the [issues page](https://github.com/eth-educators/ethstaker-deposit-cli/issues) for help or to report a problem. You may also contact us on the [Ethstaker discord](https://dsc.gg/ethstaker).
