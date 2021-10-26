# Wagyu Key Gen
Wagyu Key Gen is a GUI application providing functionality to the [eth2.0-deposit-cli](https://github.com/ethereum/eth2.0-deposit-cli). It is a React app running in Electron.  See `src/electron/` for the simple electron app and `src/react/` for where the magic happens.

### Download wagyu at [https://wagyu.gg](https://wagyu.gg)

## Environment Configuration & Dependencies
Prior to running Wagyu Key Gen a few dependencies need to be installed. 

- Install yarn & npm
    - `sudo apt update`
    - `sudo apt remove cmdtest yarn`
    - `sudo apt install npm`
    - `sudo npm install -g yarn`
- pip 
    - `sudo apt install python3-pip`
- Pycryptodome
    - `pip install pycryptodome`
- ETH utilis
    - `pip install eth_utils`
- pyecc
    - `pip install py_ecc`
- ssz
    - `pip install ssz`
- pyinstaller (to bundle python parts)
    - `pip install pyinstaller`

- On Windows, install Node.js, npm, yarn and Python 3
    - Download and install Node.js and npm from https://nodejs.org/en/download/ (Use LTS version). It should also install Python 3 with chocolatey.
    - `npm install -g yarn`
- pip
    - Download the get-pip.py script from https://bootstrap.pypa.io/get-pip.py
    - `python get-pip.py`

NOTE: Additionally, make sure you are running the latest version of Node.js with NPM. Wagyu Key Gen requires at least Node version 12.13.0. On Ubuntu/Debian, you can install a more recent version using [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md).

## Start Wagyu Key Gen
Start by cloning this repo and entering the directory.

Then run the following:

 - `yarn install`
 - `yarn build`
   - `yarn build:watch` (will reload build on changes)
   - _In order to get them to show in the app press `ctrl+r` or `cmd+r` once the app is started._
 - `yarn start`

## To run diagnostics
To open dev tools when in Wagyu Key Gen use `Ctrl + shift + i`

## Bundling
We use [electron-builder](https://www.electron.build/) to create executable bundles for Wagyu Key Gen.  Run the following to create a bundle:
 - `yarn run build`
 - `yarn run buildcli` (or `yarn run buildcliwin` on Windows)
 - `yarn run dist`

Your assets will be in the `dist/` folder.

## Design
Current designs: https://www.figma.com/file/jcF78fVjndvM2hOPvifl0N/Wagyu-Key?node-id=1%3A4

## Funding

If you would like to help us with funding this project, you can donate with our [Gitcoin grant](https://gitcoin.co/grants/2112/stakehouse-wagyu-tooling-suite-easy-to-use-tools-) or you can send your funds directly to `wagyutools.eth`.

## Support
Reach out to the EthStaker community:
 - on [discord](https://invite.gg/ethstaker)
 - on [reddit](https://www.reddit.com/r/ethstaker/)

## License
[GPL](LICENSE)
