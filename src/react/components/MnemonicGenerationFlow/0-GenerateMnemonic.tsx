import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import { shell } from "electron";
import styled from "styled-components";

const StyledLink = styled(Typography)`
  cursor: pointer;
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
        <Typography variant="body1" align="left">
          In this step, we'll be generating a Secret Recovery Phrase (traditionally referred to as a "mnemonic") and a set of validator keys for you. For more information, visit: <StyledLink display="inline" color="primary" onClick={sendToKeyInfo}>What are ETH 2.0 Keys?</StyledLink>
          <br/><br/>
          It is *very* important to keep these safe and secure as you will need them to retrieve your funds later. Anybody with access to these will also be able to retrieve your funds! For tips on storage, see: <StyledLink display="inline" color="primary" onClick={sendToPassphraseProtection}>How to protect your seed phrase.</StyledLink>
          <br/><br/>
          If possible, this should be run on a computer that is not connected to the internet. You can move Wagyu Key Gen to a USB stick, plug it into an offline machine, and run it from there if you'd like.
        </Typography>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default GenerateMnemonic;
