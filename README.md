# Wagyu Key Gen
Wagyu Key Gen is a GUI application providing functionality to the [eth2.0-deposit-cli](https://github.com/ethereum/eth2.0-deposit-cli).

## Setup
Wagyu Key Gen is a React app running in Electron.  See `src/electron/` for the simple electron app and `src/react/` for where the magic happens.

Start by cloning this repo and enter the directory by running `git clone https://github.com/stake-house/wagyu-key-gen.git` and `cd wagyu-key-gen`.  Then run the following:
 - `yarn install`
 - `yarn build` (will reload build on changes)
   - _In order to get them to show in the app press `ctrl+r` or `cmd+r` once the app is started._
 - `yarn start`

### Material UI

https://www.youtube.com/watch?v=pHclLuRolzE

### Storybook
 - `yarn storybook` to start storybook

## Design
Current designs: https://www.figma.com/file/jcF78fVjndvM2hOPvifl0N/Wagyu-Key?node-id=1%3A4

## Support
Reach out to the EthStaker community:
 - on [discord](https://invite.gg/ethstaker)
 - on [reddit](https://www.reddit.com/r/ethstaker/)

## License
[GPL](LICENSE)
