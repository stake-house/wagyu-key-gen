import { Grid, TextField, Typography } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import { errors } from '../../constants';

type VerifyKeysPasswordProps = {
  setVerifyPassword: Dispatch<SetStateAction<string>>,
  passwordVerifyError: boolean,
}

const VerifyKeysPassword: FC<VerifyKeysPasswordProps> = (props): ReactElement => {

  const updateVerifyPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setVerifyPassword(e.target.value);
  }

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item xs={12}>
        <Typography>
          Just to be sure...
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
            id="password"
            label="Retype Password"
            type="password"
            variant="outlined"
            onChange={updateVerifyPassword}
            error={props.passwordVerifyError}
            helperText={props.passwordVerifyError ? errors.PASSWORD_MATCH : ""}
            style = {{width: 300}}
          />
      </Grid>
    </Grid>
  );
}

export default VerifyKeysPassword;