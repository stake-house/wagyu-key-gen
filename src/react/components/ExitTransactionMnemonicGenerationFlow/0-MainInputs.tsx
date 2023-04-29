import { Grid, TextField, Tooltip, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction } from 'react';
import styled from "styled-components";
import { errors, tooltips } from '../../constants';

type GenerateKeysProps = {
  index: number,
  setIndex: Dispatch<SetStateAction<number>>,
  epoch: number,
  setEpoch: Dispatch<SetStateAction<number>>,
  validatorIndices: string,
  setValidatorIndices: Dispatch<SetStateAction<string>>,
  startingIndexError: boolean,
  setStartingIndexError: Dispatch<SetStateAction<boolean>>,
  indicesError: boolean,
  setIndicesError: Dispatch<SetStateAction<boolean>>,
  indicesErrorMsg: string,
  setIndicesErrorMsg: Dispatch<SetStateAction<string>>,
  onFinish: () => void
}

const IndexTextField = styled(TextField)`
  width: 350px;
`;

const EpochTextField = styled(TextField)`
  width: 350px;
`;

const IndicesTextField = styled(TextField)`
  width: 560px;
`;

/**
 * This page gathers data about the keys to generate for the user
 *
 * @param props self documenting parameters passed in
 * @returns
 */
const MainInputs = (props: GenerateKeysProps) => {

  const updateIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    props.setIndex(num);
  }

  const updateEpoch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    props.setEpoch(num);
  }

  const updateIndices = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setValidatorIndices(e.target.value.trim());
  }

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
      <Grid item xs={6}>
        <Tooltip title={tooltips.START_INDEX}>
          <IndexTextField
            id="index"
            label="Start index"
            variant="outlined"
            type="number"
            value={props.index}
            onChange={updateIndex}
            InputProps={{ inputProps: { min: 0 } }}
            error={props.startingIndexError}
            helperText={props.startingIndexError ? errors.STARTING_INDEX : ""}
            required
          />
        </Tooltip>
      </Grid>
      <Grid item xs={6}>
        <Tooltip title={tooltips.EXIT_EPOCH}>
          <EpochTextField
            id="epoch"
            label="Epoch"
            variant="outlined"
            type="number"
            value={props.epoch}
            onChange={updateEpoch}
            InputProps={{ inputProps: { min: 0 } }}
            error={props.startingIndexError}
            helperText={props.startingIndexError ? errors.STARTING_INDEX : ""}
            required
          />
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Tooltip title={tooltips.VALIDATOR_INDICES}>
          <IndicesTextField
            id="indices"
            label="Indices or validator indexes (comma separated)"
            variant="outlined"
            type="string"
            value={props.validatorIndices}
            onChange={updateIndices}
            error={props.indicesError}
            helperText={props.indicesError ? props.indicesErrorMsg : ""}
            required
          />
        </Tooltip>
      </Grid>
    </Grid>
  );
}

export default MainInputs;
