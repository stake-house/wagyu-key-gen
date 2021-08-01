import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';

const GenerateMnemonic: FC<{}> = (): ReactElement => {
  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid item xs={10}>
        <Typography variant="body1" align="left">
          We'll be generating both a mnemonic and validator keys for you. (insert link explaining what they are)
          <br/><br/>
          It is very important to keep both safe and secure as you will need it to retrieve your funds later.  (insert tips on storage)
          <br/><br/>
          If possible, you should run this on a computer that is not connected to the internet.  You can move Wagyu Key Gen to a USB stick, plug into an offline machine, and run it from there if you'd like.
        </Typography>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default GenerateMnemonic;
