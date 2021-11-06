import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import styled, { keyframes } from 'styled-components';

type CreatingKeysProps = {
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
`;

/**
 * The waiting screen while keys are being created.
 * 
 * @returns react element to render
 */
const CreatingKeys: FC<CreatingKeysProps> = (): ReactElement => {
  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid container item direction="column" spacing={3} xs={10}>
        <Grid item container xs={12}>
          <Typography variant="body1" align="left">
            The duration of this process depends on how many keys you are generating and the performance of your computer.  Generating one key takes about 30 seconds.  Generating 100 keys may take about 10 minutes.
          </Typography>
        </Grid>
        <Grid item container xs={12} justifyContent="center">
          <Loader />
        </Grid>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default CreatingKeys;