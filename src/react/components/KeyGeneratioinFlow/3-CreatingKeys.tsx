import { CircularProgress, Grid, Typography } from '@material-ui/core';
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

const CreatingKeys: FC<CreatingKeysProps> = (props): ReactElement => {
  return (
    <Grid container direction="column" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="body1">
          Creating keys....
        </Typography>
      </Grid>
      <Grid item container xs={12} justifyContent="center">
        <Loader />
      </Grid>
    </Grid>
  );
}

export default CreatingKeys;