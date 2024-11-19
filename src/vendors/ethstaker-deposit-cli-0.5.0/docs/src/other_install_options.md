# Other Install Options

## Linux or MacOS users

### Option 1. Build `deposit-cli` with native Python

1. **Python version checking**

    Ensure you are using Python version >= Python3.9:

    ```sh
    python3 -V
    ```

2. **Installation**

    Install the dependencies:

    ```sh
    pip3 install -r requirements.txt
    ```

    Or use the helper script:

    ```sh
    ./deposit.sh install
    ```

3. **Create keys and `deposit_data-*.json`**

    Run one of the following command to enter the interactive CLI:

    ```sh
    ./deposit.sh new-mnemonic
    ```

    or

    ```sh
    ./deposit.sh existing-mnemonic
    ```

    You can also run the tool with optional arguments:

    ```sh
    ./deposit.sh new-mnemonic --num_validators=<NUM_VALIDATORS> --mnemonic_language=english --chain=<CHAIN_NAME> --folder=<YOUR_FOLDER_PATH>
    ```

    ```sh
    ./deposit.sh existing-mnemonic --num_validators=<NUM_VALIDATORS> --validator_start_index=<START_INDEX> --chain=<CHAIN_NAME> --folder=<YOUR_FOLDER_PATH>
    ```

### Option 2. Build `deposit-cli` with `virtualenv`

1. **Python version checking**

    Ensure you are using Python version >= Python3.9:

    ```sh
    python3 -V
    ```

2. **Installation**

    Install `venv` if not already installed, e.g. for Debian/Ubuntu:

    ```sh
    sudo apt update && sudo apt install python3-venv
    ```

    Create a new [virtual environment](https://docs.python.org/3/library/venv.html):

    ```sh
    python3 -m venv .venv
    source .venv/bin/activate
    ```

    and install the dependencies:

    ```sh
    pip3 install -r requirements.txt
    ```

3. **Create keys and `deposit_data-*.json`**

    Run one of the following command to enter the interactive CLI:

    ```sh
    python3 -m ethstaker_deposit new-mnemonic
    ```

    or

    ```sh
    python3 -m ethstaker_deposit existing-mnemonic
    ```

    You can also run the tool with optional arguments:

    ```sh
    python3 -m ethstaker_deposit new-mnemonic --num_validators=<NUM_VALIDATORS> --mnemonic_language=english --chain=<CHAIN_NAME> --folder=<YOUR_FOLDER_PATH>
    ```

    ```sh
    python3 -m ethstaker_deposit existing-mnemonic --num_validators=<NUM_VALIDATORS> --validator_start_index=<START_INDEX> --chain=<CHAIN_NAME> --folder=<YOUR_FOLDER_PATH>
    ```

### Option 3. Use published docker image

1. **Pull the official docker image**

    Run the following command to pull the latest docker image published on the Github repository:

    ```sh
    docker pull ghcr.io/eth-educators/ethstaker-deposit-cli:latest
    ```

2. **Create keys and `deposit_data-*.json`**

    Run the following command to enter the interactive CLI:

    ```sh
    docker run -it --rm -v $(pwd)/validator_keys:/app/validator_keys ghcr.io/eth-educators/ethstaker-deposit-cli:latest
    ```

    You can also run the tool with optional arguments:

    ```sh
    docker run -it --rm -v $(pwd)/validator_keys:/app/validator_keys ghcr.io/eth-educators/ethstaker-deposit-cli:latest new-mnemonic --num_validators=<NUM_VALIDATORS> --mnemonic_language=english
    ```

    Example for 1 validator on the [Holesky testnet](https://holesky.launchpad.ethereum.org/) using english:

    ```sh
    docker run -it --rm -v $(pwd)/validator_keys:/app/validator_keys ghcr.io/eth-educators/ethstaker-deposit-cli:latest new-mnemonic --num_validators=1 --mnemonic_language=english --chain=holesky
    ```

### Option 4. Use local docker image

1. **Build the docker image**

    Run the following command to locally build the docker image:

    ```sh
    make build_docker
    ```

2. **Create keys and `deposit_data-*.json`**

    Run the following command to enter the interactive CLI:

    ```sh
    docker run -it --rm -v $(pwd)/validator_keys:/app/validator_keys eth-educators/ethstaker-deposit-cli
    ```

    You can also run the tool with optional arguments:

    ```sh
    docker run -it --rm -v $(pwd)/validator_keys:/app/validator_keys eth-educators/ethstaker-deposit-cli new-mnemonic --num_validators=<NUM_VALIDATORS> --mnemonic_language=english
    ```

    Example for 1 validator on the [Holesky testnet](https://holesky.launchpad.ethereum.org/) using english:

    ```sh
    docker run -it --rm -v $(pwd)/validator_keys:/app/validator_keys eth-educators/ethstaker-deposit-cli new-mnemonic --num_validators=1 --mnemonic_language=english --chain=holesky
    ```

----

## For Windows users


### Option 1. Build `deposit-cli` with native Python

1. **Python version checking**

    Ensure you are using Python version >= Python12 (Assume that you've installed Python 3 as the main Python):

    ```sh
    python -V
    ```

2. **Installation**

    Install the dependencies:

    ```sh
    pip3 install -r requirements.txt
    ```

    Or use the helper script:

    ```sh
    sh deposit.sh install
    ```

3. **Create keys and `deposit_data-*.json`**

    Run one of the following command to enter the interactive CLI:

    ```sh
    ./deposit.sh new-mnemonic
    ```

    or

    ```sh
    ./deposit.sh existing-mnemonic
    ```

    You can also run the tool with optional arguments:

    ```sh
    ./deposit.sh new-mnemonic --num_validators=<NUM_VALIDATORS> --mnemonic_language=english --chain=<CHAIN_NAME> --folder=<YOUR_FOLDER_PATH>
    ```

    ```sh
    ./deposit.sh existing-mnemonic --num_validators=<NUM_VALIDATORS> --validator_start_index=<START_INDEX> --chain=<CHAIN_NAME> --folder=<YOUR_FOLDER_PATH>
    ```

### Option 2. Build `deposit-cli` with `virtualenv`

1. **Python version checking**

    Ensure you are using Python version >= Python3.9 (Assume that you've installed Python 3 as the main Python):

    ```cmd
    python -V
    ```

2. **Installation**

    Create a new [virtual environment](https://docs.python.org/3/library/venv.html):

    ```sh
    python3 -m venv .venv
    .\.venv\Scripts\activate
    ```

    and install the dependencies:

    ```cmd
    pip3 install -r requirements.txt
    ```

3. **Create keys and `deposit_data-*.json`**

    Run one of the following command to enter the interactive CLI:

    ```cmd
    python -m ethstaker_deposit new-mnemonic
    ```

    or

    ```cmd
    python -m ethstaker_deposit existing-mnemonic
    ```

    You can also run the tool with optional arguments:

    ```cmd
    python -m ethstaker_deposit new-mnemonic --num_validators=<NUM_VALIDATORS> --mnemonic_language=english --chain=<CHAIN_NAME> --folder=<YOUR_FOLDER_PATH>
    ```

    ```cmd
    python -m ethstaker_deposit existing-mnemonic --num_validators=<NUM_VALIDATORS> --validator_start_index=<START_INDEX> --chain=<CHAIN_NAME> --folder=<YOUR_FOLDER_PATH>
    ```
