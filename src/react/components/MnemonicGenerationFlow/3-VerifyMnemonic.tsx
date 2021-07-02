import { Grid, TextField } from '@material-ui/core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { errors } from '../../constants';

type VerifyMnemonicProps = {
  step: number,
  setVerifyMnemonic: Dispatch<SetStateAction<string>>,
  error: boolean,
}

const VerifyMnemonic = (props: VerifyMnemonicProps) => {

  const updateInputMnemonic = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setVerifyMnemonic(e.currentTarget.value);
  }

  if (props.step == 3) {
    return (
      <Grid container direction="column" spacing={3}>
        <Grid item xs={12}>
          Please retype your mnemonic here to make sure you have it saved correctly.
        </Grid>
        <Grid item container xs={12}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <TextField
              id="verify-mnemonic"
              label="Type your mnemonic here"
              multiline
              fullWidth
              rows={4}
              variant="outlined"
              color="primary"
              error={props.error}
              helperText={ props.error ? errors.MNEMONICS_DONT_MATCH : ""}
              onChange={updateInputMnemonic} />
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return (null);
}

export default VerifyMnemonic;
