import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import styled, { keyframes } from 'styled-components';

type CreatingBTECFileProps = {
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
 * The waiting screen while the BTEC file is being created.
 * 
 * @returns react element to render
 */
const CreatingBTECFile: FC<CreatingBTECFileProps> = (): ReactElement => {
  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid container item spacing={3} xs={10}>
        <Grid item container xs={12}>
          <Typography variant="body1" align="left">
            Creating your BLS to execution change file.
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

export default CreatingBTECFile;