import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { errors } from '../constants';
import MainInputs from './ExitTransactionMnemonicGenerationFlow/0-MainInputs';
import StepNavigation from './StepNavigation';

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

        if (validateInputs()) {
          props.onStepForward();
        }
        break;
      }
    }
  }

  const disableNext = () => {
    switch(step) {
      case 0:
        if (!(props.index >= 0) || !(props.epoch >= 0) || !props.validatorIndices) {
          return true;
        }

        return false;
      default:
        return false;
    }
  }

  /**
   * Will go through the inputs index, epoch, and indices to verify all are valid
   *
   * @returns If the inputs are valid
   */
  const validateInputs = (): boolean => {
    let isError = false;

    if (props.index < 0) {
      setStartingIndexError(true);
      isError = true;
    } else {
      setStartingIndexError(false);
    }

    const splitIndices = props.validatorIndices.split(',');

    if (props.validatorIndices == "") {
      setIndicesError(true);
      setIndicesErrorMsg(errors.INDICES);
      isError = true;
    } else {
      // Validate if all integers

      let indiceFormatError = false;
      splitIndices.forEach( (indice) => {
        if (!/^\d+$/.test(indice)) {
          indiceFormatError = true;
        }
      });

      if (indiceFormatError) {
        setIndicesError(true);
        setIndicesErrorMsg(errors.INDICES_FORMAT);
        isError = true;
      } else {
        setIndicesError(false);
      }
    }

    return !isError;
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
