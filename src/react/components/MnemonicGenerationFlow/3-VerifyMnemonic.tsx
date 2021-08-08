import { Grid, TextField } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import { errors } from '../../constants';

type VerifyMnemonicProps = {
  verifyMnemonic: string,
  setVerifyMnemonic: Dispatch<SetStateAction<string>>,
  error: boolean,
}

const VerifyMnemonic: FC<VerifyMnemonicProps> = (props): ReactElement => {

  const updateInputMnemonic = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setVerifyMnemonic(e.currentTarget.value);
  }

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item xs={12}>
        Please retype your Secret Recovery Phrase here to make sure you have it saved correctly.
      </Grid>
      <Grid item container xs={12}>
        <Grid item xs={1} />
        <Grid item xs={10}>
          <TextField
            id="verify-mnemonic"
            label="Type your Secret Recovery Phrase here"
            multiline
            fullWidth
            rows={4}
            variant="outlined"
            color="primary"
            error={props.error}
            helperText={ props.error ? errors.MNEMONICS_DONT_MATCH : ""}
            value={props.verifyMnemonic}
            onChange={updateInputMnemonic} />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default VerifyMnemonic;
