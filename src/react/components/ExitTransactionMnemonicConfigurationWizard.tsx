import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import StepNavigation from './StepNavigation';
import MainInputs from './ExitTransactionMnemonicGenerationFlow/0-MainInputs';

const ContentGrid = styled(Grid)`
  height: 350px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  index: number,
  setIndex: Dispatch<SetStateAction<number>>,
  epoch: number,
  setEpoch: Dispatch<SetStateAction<number>>,
  validatorIndices: string,
  setValidatorIndices: Dispatch<SetStateAction<string>>,
  outputFolderPath: string,
  setOutputFolderPath: Dispatch<SetStateAction<string>>
}

/**
 * This is the wizard the user will navigate to configure their exit transaction change
 * @returns the react element to render
 */
const ExitTransactionConfigurationMnemonicWizard: FC<Props> = (props): ReactElement => {
  const [step, setStep] = useState(0);
  const [startingIndexError, setStartingIndexError] = useState(false);
  const [indicesError, setIndicesError] = useState(false);
  const [indicesErrorMsg, setIndicesErrorMsg] = useState("");

  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Back";
    }
  }

  const prevClicked = () => {
    switch (step) {
      case 0: {
        props.onStepBack();
        break;
      }
      default: {
        break;
      }
    }
  }

  const nextLabel = () => {
    switch (step) {
      case 0:
        return "Next";
    }
  }

  const nextClicked = () => {
    switch (step) {
      case 0: {
        if (disableNext()) {
          return;
        }

        props.onStepForward();
        break;
      }
    }
  }

  const disableNext = () => {
    switch(step) {
      case 0:
        return false;
      default:
        return false;
    }
  }

  const validateInputs = () => {
  }

  const content = () => {
    switch(step) {
      case 0:
        return (
          <MainInputs
            index={props.index}
            setIndex={props.setIndex}
            epoch={props.epoch}
            setEpoch={props.setEpoch}
            validatorIndices={props.validatorIndices}
            setValidatorIndices={props.setValidatorIndices}
            startingIndexError={startingIndexError}
            setStartingIndexError={setStartingIndexError}
            indicesError={indicesError}
            setIndicesError={setIndicesError}
            indicesErrorMsg={indicesErrorMsg}
            setIndicesErrorMsg={setIndicesErrorMsg}
            onFinish={validateInputs}
        />
        );
      default:
        return null;
    }
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
          Generate signed exit transaction
        </Typography>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={12}>
          {content()}
        </Grid>
      </ContentGrid>
      {props.children}
      <StepNavigation
        onPrev={prevClicked}
        onNext={nextClicked}
        backLabel={prevLabel()}
        nextLabel={nextLabel()}
        disableBack={false}
        disableNext={disableNext()}
      />
    </Grid>
  );
}

export default ExitTransactionConfigurationMnemonicWizard;
