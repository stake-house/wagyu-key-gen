import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, useState, Dispatch, SetStateAction, useEffect } from 'react';
import styled from 'styled-components';
import { uname } from '../commands/BashUtils';
import { createMnemonic } from '../commands/Eth2Deposit';
import GenerateMnemonic from './MnemonicGenerationFlow/0-GenerateMnemonic';
import ShowMnemonic from './MnemonicGenerationFlow/1-2-ShowMnemonic';
import VerifyMnemonic from './MnemonicGenerationFlow/3-VerifyMnemonic';
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  mnemonic: string,
  setMnemonic: Dispatch<SetStateAction<string>>,
  verifyMnemonic: string,
  setVerifyMnemonic: Dispatch<SetStateAction<string>>,
  onStepBack: () => void,
  onStepForward: () => void
}

const MnemonicGenerationWizard: FC<Props> = (props): ReactElement => {
  // If verifyMnemonic has a value, then the user is moving backwards through the stepper
  const intitialStep = props.verifyMnemonic ? 3 : 0;
  const [step, setStep] = useState(intitialStep);
  const [mnemonicValidationError, setMnemonicValidationError] = useState(false);

  useEffect(() => {
    console.log("step is: " + step);

    if (step == 0) {
      props.setMnemonic("");
    } else if (step == 1 && props.mnemonic == "") {
      console.log("creating mnemonic");
      uiCreateMnemonic();
    } else if (step == 2) {
      props.setVerifyMnemonic("");
      setMnemonicValidationError(false);
    } else if (step == 4) {
      console.log("verifying mnemonic");
      verifyMnemonic();
    }
  }, [step])

  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Back";
      case 1:
        return "Back";
      case 2:
        return "Back";
      case 3:
        return "Back";
    }
  }

  const prevClicked = () => {
    setStep(step - 1);
  }

  const nextLabel = () => {
    switch (step) {
      case 0:
        return "Create";
      case 1:
        return "Next";
      case 2:
        return "I'm sure";
      case 3:
        return "Check";
    }
  }

  const disableNext = () => {
    return step == 1 && props.mnemonic == "";
  }

  const nextClicked = () => {
    setStep(step + 1);
  }

  const verifyMnemonic = () => {
    if (props.mnemonic.localeCompare(props.verifyMnemonic) == 0) {
      setMnemonicValidationError(false);
      props.onStepForward();
    } else {
      setMnemonicValidationError(true);
      setStep(step-1); // back to 3
    }
  }

  const uiCreateMnemonic = () => {
    console.log("Generating mnemonic...");
    createMnemonic('english')
      .then((mnemonic) => {
        props.setMnemonic(mnemonic);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const content = () => {
    switch(step) {
      case 0: return (
        <GenerateMnemonic />
      );
      case 1: case 2: return (
        <ShowMnemonic showCopyWarning={step === 2} mnemonic={props.mnemonic} />
      );
      case 3: return (
        <VerifyMnemonic
          setVerifyMnemonic={props.setVerifyMnemonic}
          verifyMnemonic={props.verifyMnemonic}
          error={mnemonicValidationError}
          onVerifyMnemonic={verifyMnemonic}
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
          Create Secret Recovery Phrase
        </Typography>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={12}>
          {content()}
        </Grid>
      </ContentGrid>
      {/* props.children is the stepper */}
      {props.children}
      <StepNavigation
        onPrev={prevClicked}
        onNext={nextClicked}
        backLabel={prevLabel()}
        nextLabel={nextLabel()}
        disableNext={disableNext()}
      />
    </Grid>
  );
}

export default MnemonicGenerationWizard;
