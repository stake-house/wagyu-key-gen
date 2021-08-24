# Wagyu Key Gen
Wagyu Key Gen is a GUI application providing functionality to the [eth2.0-deposit-cli](https://github.com/ethereum/eth2.0-deposit-cli). It is a React app running in Electron.  See `src/electron/` for the simple electron app and `src/react/` for where the magic happens.

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

NOTE: Additionally, make sure you are running the latest version of Node.js with NPM. Wagyu Key Gen requires at least Node version 12.13.0.

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

## Design
Current designs: https://www.figma.com/file/jcF78fVjndvM2hOPvifl0N/Wagyu-Key?node-id=1%3A4

## Support
Reach out to the EthStaker community:
 - on [discord](https://invite.gg/ethstaker)
 - on [reddit](https://www.reddit.com/r/ethstaker/)

## License
[GPL](LICENSE)
