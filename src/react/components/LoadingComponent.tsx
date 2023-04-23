import { Grid } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import styled, { keyframes } from 'styled-components';

type LoadingComponentProps = {
  children: React.ReactNode;
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
const LoadingComponent: FC<LoadingComponentProps> = (props): ReactElement => {
  return (
    <Grid container>
      <Grid item xs={1} />
      <Grid container item spacing={3} xs={10}>
        <Grid item container xs={12}>
          {props.children}
        </Grid>
        <Grid item container xs={12} justifyContent="center">
          <Loader />
        </Grid>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default LoadingComponent;
