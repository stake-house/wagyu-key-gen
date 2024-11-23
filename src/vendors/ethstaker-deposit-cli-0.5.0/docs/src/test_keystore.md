# test-keystore

{{#include ./snippet/warning_message.md}}

## Description
Will verify access to the provided keystore file by attempting to decrypt it with the provided keystore password.


## Optional Arguments

- **`--keystore`**: The keystore file you wish to verify.

- **`--keystore_password`**: The password used to attempt decryption of the provided keystore file. Note: It is not your mnemonic password. <span class="warning"></span>


## Example Usage

```sh
./deposit test-keystore --keystore /path/to/keystore.json
```
