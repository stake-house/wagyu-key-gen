import { Box, Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import { shell } from "electron";
import styled from "styled-components";

const StyledLink = styled(Typography)`
  cursor: pointer;
  display: inline;
`;

const LoudText = styled(Typography)`
  color: cyan;
  display: inline;
`;

const GenerateMnemonic: FC<{}> = (): ReactElement => {

  const sendToKeyInfo = () => {
    shell.openExternal("https://kb.beaconcha.in/ethereum-2-keys");
  }

  const sendToPassphraseProtection = () => {
    shell.openExternal("https://www.ledger.com/blog/how-to-protect-your-seed-phrase");
  }

  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid item xs={10}>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left">
            In this step, we'll generate a Secret Recovery Phrase (traditionally referred to as a "mnemonic") and a set of validator keys for you. For more information, visit: <StyledLink display="inline" color="primary" onClick={sendToKeyInfo}>What are ETH 2.0 Keys?</StyledLink>
          </Typography>
        </Box>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left" gutterBottom>
            It is <b>very</b> important to <LoudText>keep both your secret recovery phrase and your validator keys safe and secure</LoudText> as you will need them to retrieve your funds later. Anybody with access to these will also be able to steal your funds! For tips on storage, see: <StyledLink display="inline" color="primary" onClick={sendToPassphraseProtection}>How to protect your seed phrase.</StyledLink>
          </Typography>
        </Box>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left" gutterBottom>
            We recommend running Wagyu Key Gen from an offline machine. One way to do this is to move the application to a USB stick, plug it in to an offline machine, and run it from there.
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default GenerateMnemonic;
