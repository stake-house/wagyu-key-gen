import { Button, Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import ExitTransactionsCreated from './ExitTransactionGenerationFlow/4-ExitTransactionsCreated';

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  folderPath: string,
  multiple: boolean
}

/**
 * This is the final page displaying information about the keys
 *
 * @param props.onStepBack the function to execute when the user steps back
 * @param props.onStepForward the function to execute when the user steps forward
 * @param props.folderPath the folder path where the keys are located, for display purposes
 * @param props.network the network the app is running for
 * @returns the react element to render
 */
const FinishExitTransaction: FC<Props> = (props): ReactElement => {
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
            Generate signed exit transaction
        </Typography>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={12}>
          <ExitTransactionsCreated folderPath={props.folderPath} multiple={props.multiple}/>
        </Grid>
      </ContentGrid>
      {props.children}
      <Grid item container justifyContent="space-between">
        <Grid item xs={5} />
        <Grid item xs={2}>
          <Button variant="contained" color="primary" onClick={props.onStepForward} tabIndex={2}>Close</Button>
        </Grid>
        <Grid item xs={5} />
      </Grid>
    </Grid>
  );
}

export default FinishExitTransaction;
