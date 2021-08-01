import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import KeyInputs from './KeyGeneratioinFlow/0-KeyInputs';
import VerifyKeysPassword from './KeyGeneratioinFlow/1-VerifyKeysPassword';
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 350px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  keyGenerationStartIndex: number | null,
  setKeyGenerationStartIndex: Dispatch<SetStateAction<number | null>>,
  numberOfKeys: number,
  setNumberOfKeys: Dispatch<SetStateAction<number>>,
  password: string,
  setPassword: Dispatch<SetStateAction<string>>
}

const KeyConfigurationWizard: FC<Props> = (props): ReactElement => {
  const [step, setStep] = useState(0);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [numberOfKeysError, setNumberOfKeysError] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState(false);
  const [passwordVerifyError, setPasswordVerifyError] = useState(false);
  const [startingIndexError, setStartingIndexError] = useState(false);
  
  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Back";
      case 1:
        return "Back";
    }
  }

  const prevClicked = () => {
    switch (step) {
      case 0: {
        setNumberOfKeysError(false);
        setPasswordStrengthError(false);
        setStartingIndexError(false);
        props.onStepBack();
        break;
      }
      case 1: {
        setPasswordVerifyError(false);
        props.setPassword("");
        setVerifyPassword("");
        setStep(step - 1);
        break;
      }
      default: {
        console.log("This should never happen.")
        break;
      }
    }
  }

  const nextLabel = () => {
    switch (step) {
      case 0:
        return "Next";
      case 1:
        return "Verify";
    }
  }

  const nextClicked = () => {
    switch (step) {

      // Inputs
      case 0: {
        let isError = false;

        if (props.numberOfKeys < 1) {
          setNumberOfKeysError(true);
          isError = true;
        } else {
          setNumberOfKeysError(false);
        }
        
        if (props.password.length < 8) {
          setPasswordStrengthError(true);
          isError = true;
        } else {
          setPasswordStrengthError(false);
        }
        
        if (props.keyGenerationStartIndex == null || props.keyGenerationStartIndex < 0) {
          setStartingIndexError(true);
          isError = true;
        } else {
          setStartingIndexError(false);
        }

        if (!isError) {
          setStep(step + 1);
        }

        break;
      }

      // Verify Password
      case 1: {
        if (props.password.localeCompare(verifyPassword) == 0) {
          setPasswordVerifyError(false);
          props.onStepForward();
        } else {
          setPasswordVerifyError(true);
        }

        break;
      }

      default: {
        console.log("This should never happen.")
        break;
      }
    }
  }

  const content = () => {
    switch(step) {
      case 0: return (
        <KeyInputs
          numberOfKeys={props.numberOfKeys}
          setNumberOfKeys={props.setNumberOfKeys}
          index={props.keyGenerationStartIndex}
          setIndex={props.setKeyGenerationStartIndex}
          password={props.password}
          setPassword={props.setPassword}
          numberOfKeysError={numberOfKeysError}
          passwordStrengthError={passwordStrengthError}
          startingIndexError={startingIndexError}
        />
      );
      case 1: return (
        <VerifyKeysPassword setVerifyPassword={setVerifyPassword} passwordVerifyError={passwordVerifyError} />
      );
      default:
        return null;
    }
  }

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
          {content()}
        </Grid>
      </ContentGrid>
      {props.children}
      <StepNavigation
        onPrev={prevClicked}
        onNext={nextClicked}
        backLabel={prevLabel()}
        nextLabel={nextLabel()}
      />
    </Grid>
  );
}

export default KeyConfigurationWizard;