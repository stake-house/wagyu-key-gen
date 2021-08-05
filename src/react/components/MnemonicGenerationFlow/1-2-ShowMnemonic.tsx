import { Tooltip, IconButton, Grid, TextField, Typography } from '@material-ui/core';
import { FileCopy } from '@material-ui/icons';
import { clipboard } from 'electron';
import React from 'react';

type ShowMnemonicProps = {
  step: number,
  mnemonic: string,
}

const ShowMnemonic = (props: ShowMnemonicProps) => {

  const copyMnemonic = () => {
    clipboard.writeText(props.mnemonic);
  }

  if (props.step == 1 || props.step == 2) {
    return (
      <Grid container direction="column" spacing={3}>
        <Grid item xs={12}>
          Below is your Secret Recovery Phrase.  Make sure you back it up - without it you will not be able to retrieve your funds.
        </Grid>
        <Grid item container xs={12}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <TextField
              id="mnemonic-display"
              value={props.mnemonic}
              multiline
              fullWidth
              rows={4}
              variant="outlined"
              color="primary"
              disabled />
          </Grid>
          <Grid item xs={1} style={{alignSelf: "center"}}>
            <Tooltip title="Copy">
              <IconButton aria-label="copy" color="primary" onClick={copyMnemonic}>
                <FileCopy />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        { props.step == 2 &&
          <Grid item xs={12}>
            <Typography color="error">
              Make sure you have written down your Secret Recovery Phrase *offline*, you will be prompted for it next.
            </Typography>
          </Grid>
        }
      </Grid>
    );
  }

  return (null);
}

export default ShowMnemonic;
