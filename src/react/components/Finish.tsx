import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import KeysCreated from './KeyGeneratioinFlow/4-KeysCreated';
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 350px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  folderPath: string,
  setFolderPath: Dispatch<SetStateAction<string>>,
}

const Finish: FC<Props> = (props): ReactElement => {
  return (
    <Grid container spacing={5} direction="column">
      <Grid item container>
        <Grid item xs={12}>
          <Typography variant="h1">
            Generate Keys
          </Typography>
        </Grid>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={12}>
          <KeysCreated folderPath={props.folderPath} />
        </Grid>
      </ContentGrid>
      {props.children}
      <StepNavigation
        onPrev={props.onStepBack}
        onNext={props.onStepForward}
        backLabel="Back"
        nextLabel="Finish"
      />
    </Grid>
  );
}

export default Finish;