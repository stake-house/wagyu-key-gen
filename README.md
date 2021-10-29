# Wagyu Key Gen
Wagyu Key Gen is a GUI application providing functionality to the [eth2.0-deposit-cli](https://github.com/ethereum/eth2.0-deposit-cli). It is a React app running in Electron.  See `src/electron/` for the simple electron app and `src/react/` for where the magic happens.

### Download wagyu at [https://wagyu.gg](https://wagyu.gg)

## Environment Configuration & Dependencies
Prior to running Wagyu Key Gen a few dependencies need to be installed. 

### Ubuntu 20.04 and later
Execute all those commands in your terminal to setup your dev environment.

```
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

sudo apt install -y build-essential nodejs git python3-distutils python3-dev

PATH="$HOME/.local/bin:$PATH"

curl -sSL https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
pip3 install pyinstaller

sudo npm install -g yarn

git clone https://github.com/stake-house/wagyu-key-gen
cd wagyu-key-gen

yarn install
yarn buildcli
```

### Ubuntu 18.04
Even if Ubuntu 18.04 is somewhat old, it is a great OS to build our releases on for the Linux target because it has an older GLIBC which makes it more compatible. More details [here](https://pyinstaller.readthedocs.io/en/stable/usage.html#making-gnu-linux-apps-forward-compatible).

Execute all those commands in your terminal to build a distribution for release.
```console
sudo apt update && sudo apt -y upgrade

sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

sudo apt install -y python3.7-dev zlib1g-dev build-essential nodejs git

PATH="$HOME/.local/bin:$PATH"

curl -sSL https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3.7 get-pip.py
pip3 install pyinstaller
alias python3=python3.7
echo -e "\nalias python3=python3.7" >> ~/.bash_aliases

sudo npm install -g yarn

git clone https://github.com/stake-house/wagyu-key-gen
cd wagyu-key-gen

yarn install
yarn build
yarn buildcli
yarn dist
```

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
