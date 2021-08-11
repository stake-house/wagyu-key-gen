import { Grid, TextField, Typography } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import styled from "styled-components";
import { errors } from '../../constants';

const Form = styled.form`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`

const StyledTextField = styled(TextField)`
  margin: 12px 0;
  width: 300px;
`

type VerifyKeysPasswordProps = {
  setVerifyPassword: Dispatch<SetStateAction<string>>,
  passwordVerifyError: boolean,
  onFinish: () => void
}

const VerifyKeysPassword: FC<VerifyKeysPasswordProps> = (props): ReactElement => {

  const updateVerifyPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setVerifyPassword(e.target.value);
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLFormElement>) => {
    if (evt.key === 'Enter') {
      props.onFinish();
    }
  }

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item xs={12}>
        <Typography>
          Just to be sure...
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Form onKeyDown={handleKeyDown}>
          <StyledTextField
            id="password"
            label="Retype Password"
            type="password"
            variant="outlined"
            autoFocus
            onChange={updateVerifyPassword}
            error={props.passwordVerifyError}
            helperText={props.passwordVerifyError ? errors.PASSWORD_MATCH : ""}
          />
        </Form>
      </Grid>
    </Grid>
  );
}

export default VerifyKeysPassword;