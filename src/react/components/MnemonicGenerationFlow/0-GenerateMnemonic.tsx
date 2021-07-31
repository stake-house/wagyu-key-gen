import { Grid, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction } from 'react';

type GenerateMnemonicProps = {
  step: number
}

const GenerateMnemonic = (props: GenerateMnemonicProps) => {
  if (props.step == 0) {
    return (
      <Grid container>
        <Grid item xs={1} />
        <Grid item xs={10}>
          <Typography variant="body1" align="left">
            In this step, we'll be generating a Secret Recovery Phrase (traditionally referred to as a "mnemonic") and a set of validator keys for you. For more information, visit: <a href="https://kb.beaconcha.in/ethereum-2-keys">Link</a>
            <br/><br/>
            It is *very* important to keep these safe and secure as you will need them to retrieve your funds later. Anybody with access to these will also be able to retrieve your funds! For tips on storage, see: <a href="https://www.ledger.com/blog/how-to-protect-your-seed-phrase">Link</a>
            <br/><br/>
            If possible, this should be run on a computer that is not connected to the internet. You can move Wagyu Key Gen to a USB stick, plug it into an offline machine, and run it from there if you'd like.
          </Typography>
        </Grid>
        <Grid item xs={1} />
      </Grid>
    );
  }

  return (null);
}

export default GenerateMnemonic;
