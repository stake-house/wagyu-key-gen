import { Grid, TextField, Tooltip, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { errors, tooltips } from '../../constants';

type GenerateKeysProps = {
  step: number,
  setNumberOfKeys: Dispatch<SetStateAction<number>>,
  index: number | null,
  setIndex: Dispatch<SetStateAction<number | null>>,
  setPassword: Dispatch<SetStateAction<string>>,
  numberOfKeysError: boolean,
  passwordStrengthError: boolean,
  startingIndexError: boolean,
}

const KeyInputs = (props: GenerateKeysProps) => {
  const [indexPassedIn, setIndexPassedIn] = useState(props.index != null);

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

  if (props.step == 0) {
    return (
      <Grid container direction="column" spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body1">
            Nice!  Your mnemonic is verified.  Now lets collect some info about the keys to generate:
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title={tooltips.NUMBER_OF_KEYS}>
            <TextField
                id="number-of-keys"
                label="Number of New Keys"
                variant="outlined"
                type="number"
                onChange={updateNumberOfKeys}
                InputProps={{ inputProps: { min: 1 } }}
                error={props.numberOfKeysError}
                helperText={ props.numberOfKeysError ? errors.NUMBER_OF_KEYS : ""}
                style = {{width: 300}}
              />
          </Tooltip>
        </Grid>
        { !indexPassedIn &&
          <Grid item xs={12}>
            <Tooltip title={tooltips.STARTING_INDEX}>
              <TextField
                  id="index"
                  label="Amount of Existing (starting index)"
                  variant="outlined"
                  type="number"
                  onChange={updateIndex}
                  InputProps={{ inputProps: { min: 0 } }}
                  error={props.startingIndexError}
                  helperText={props.startingIndexError ? errors.STARTING_INDEX : ""}
                  style = {{width: 300}}
                />
            </Tooltip>
          </Grid>
        }
        <Grid item xs={12}>
          <Tooltip title={tooltips.PASSWORD}>
            <TextField
                id="password"
                label="Password"
                type="password"
                variant="outlined"
                onChange={updatePassword}
                error={props.passwordStrengthError}
                helperText={props.passwordStrengthError ? errors.PASSWORD_STRENGTH : ""}
                style = {{width: 300}}
              />
          </Tooltip>
        </Grid>
      </Grid>
    );
  }

  return (null);
}

export default KeyInputs;