import { Box, Grid, Typography } from '@material-ui/core';
import { shell } from 'electron';
import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import { Network } from '../../types';

const StyledLink = styled(Typography)`
  cursor: pointer;
  display: inline;
`;

const LoudText = styled(Typography)`
  color: cyan;
  display: inline;
`;

type KeysCreatedProps = {
  folderPath: string,
  network: Network
}




const KeysCreated: FC<KeysCreatedProps> = (props): ReactElement => {
  const sendToPassphraseProtection = () => {
    shell.openExternal("https://www.ledger.com/blog/how-to-protect-your-seed-phrase");
  }

  const sendToEthereumLaunchpad = () => {
    shell.openExternal(
      props.network == Network.MAINNET ? "https://launchpad.ethereum.org/en/" : "https://prater.launchpad.ethereum.org/en/"
    );
  }

  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid item xs={10}>
          <Box sx={{ m: 2 }}>
            <Typography variant="body1" align="left">
              Your keys have been created here: '{props.folderPath}'
            </Typography>
          </Box>
          <Box sx={{ m: 2 }}>
            <Typography variant="body1" align="left">
              There are two different files, here is a description of each:
            </Typography>
            <Typography variant="body2" align="left">
              - Keystore file(s) (ex. keystore-xxxxxxx.json): this file controls your ability to sign transactions.  It will be required to set up your validator.  Do not share with anyone.  It can be recreated from your secret recovery phrase if necessary.
            </Typography>
            <Typography variant="body2" align="left">
              - Deposit data file(s) (ex. deposit_data-xxxxxx.json): this file represents public information about your validator.  It will be required to execute your deposit through the <StyledLink display="inline" color="primary" onClick={sendToEthereumLaunchpad}>Ethereum Launchpad</StyledLink>.  It can be recreated from your secret recovery phrase if necessary.
            </Typography>
          </Box>
          <Box sx={{ m: 2 }}>
            <Typography variant="body1" align="left">
              Secret Recovery Phrase (24 words)
            </Typography>
            <Typography variant="body2" align="left">
              This was the first thing you created.  You'll need this to withdraw your funds.  Keep multiple copies written down and stored in a safe places.  See: <StyledLink display="inline" color="primary" onClick={sendToPassphraseProtection}>How to protect your seed phrase.</StyledLink>
            </Typography>
          </Box>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default KeysCreated;