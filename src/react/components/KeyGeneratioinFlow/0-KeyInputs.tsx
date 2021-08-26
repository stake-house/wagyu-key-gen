import { Grid, TextField, Tooltip, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction } from 'react';
import styled from "styled-components";
import { errors, tooltips } from '../../constants';

type GenerateKeysProps = {
  numberOfKeys: number,
  setNumberOfKeys: Dispatch<SetStateAction<number>>,
  index: number | null,
  setIndex: Dispatch<SetStateAction<number | null>>,
  showIndexInput: boolean,
  password: string,
  setPassword: Dispatch<SetStateAction<string>>,
  numberOfKeysError: boolean,
  passwordStrengthError: boolean,
  startingIndexError: boolean,
  onFinish: () => void
}

const Form = styled.form`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`

const StyledTextField = styled(TextField)`
  margin: 12px 0;
  width: 300px;
`

const KeyInputs = (props: GenerateKeysProps) => {
  const updateNumberOfKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    props.setNumberOfKeys(num);
  }

  const updateIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    props.setIndex(num);
  }

  const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setPassword(e.target.value);
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLFormElement>) => {
    if (evt.key === 'Enter') {
      props.onFinish();
    }
  }

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="body1">
          Nice!  Your Secret Recovery Phrase matches. Now let's collect some info about the keys to create:
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Form onKeyDown={handleKeyDown}>
          <Tooltip title={tooltips.NUMBER_OF_KEYS}>
            <StyledTextField
              id="number-of-keys"
              label="Number of New Keys"
              variant="outlined"
              type="number"
              autoFocus
              value={props.numberOfKeys}
              onChange={updateNumberOfKeys}
              InputProps={{ inputProps: { min: 1 } }}
              error={props.numberOfKeysError}
              helperText={ props.numberOfKeysError ? errors.NUMBER_OF_KEYS : ""}
            />
          </Tooltip>
          { props.showIndexInput &&
            <Tooltip title={tooltips.STARTING_INDEX}>
              <StyledTextField
                id="index"
                label="Amount of Existing (starting index)"
                variant="outlined"
                type="number"
                value={props.index}
                onChange={updateIndex}
                InputProps={{ inputProps: { min: 0 } }}
                error={props.startingIndexError}
                helperText={props.startingIndexError ? errors.STARTING_INDEX : ""}
              />
            </Tooltip>
          }
          <Tooltip title={tooltips.PASSWORD}>
            <StyledTextField
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              value={props.password}
              onChange={updatePassword}
              error={props.passwordStrengthError}
              helperText={props.passwordStrengthError ? errors.PASSWORD_STRENGTH : ""}
            />
          </Tooltip>
        </Form>
      </Grid>
    </Grid>
  );
}

export default KeyInputs;
