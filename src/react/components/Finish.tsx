import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import KeysCreated from './KeyGeneratioinFlow/4-KeysCreated';
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  folderPath: string,
  setFolderPath: Dispatch<SetStateAction<string>>,
}

const Finish: FC<Props> = (props): ReactElement => {
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
          Generate Keys
        </Typography>
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
        hideBack={true}
        nextLabel="Close"
        centerNext={true}
      />
    </Grid>
  );
}

export default Finish;