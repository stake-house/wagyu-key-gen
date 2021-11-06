import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, useState, Dispatch, SetStateAction, useEffect } from 'react';
import styled from 'styled-components';
import { createMnemonic } from '../commands/Eth2Deposit';
import { Network } from '../types';
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
  mnemonicToVerify: string,
  setMnemonicToVerify: Dispatch<SetStateAction<string>>,
  onStepBack: () => void,
  onStepForward: () => void,
  network: Network
}

/**
 * This is the wizard the user will navigate to generate their mnemonic.
 * It uses the notion of a 'step' to render specific pages within the flow.
 * 
 * @param props.mnemonic the mnemonic
 * @param props.setMnemonic function to update the mnemonic
 * @param props.mnemonicToVerify the user input mnemonic to check against the actual mnemonic
 * @param props.setMnemonicToVerify function to update the user input mnemonic
 * @param props.onStepBack functionality for when the user steps back
 * @param props.onStepForward functionality for when the user steps forward
 * @param props.network the network the app is running for
 * @returns the react element to render
 */
const MnemonicGenerationWizard: FC<Props> = (props): ReactElement => {
  // If mnemonicToVerify has a value, then the user is moving backwards through the stepper
  const intitialStep = props.mnemonicToVerify ? 3 : 0;
  const [step, setStep] = useState(intitialStep);
  const [mnemonicValidationError, setMnemonicValidationError] = useState(false);
  const [generateError, setGenerateError] = useState(false);
  const [generateErrorMsg, setGenerateErrorMsg] = useState("");

  useEffect(() => {
    console.log("step is: " + step);

    if (step == -1) {
      props.onStepBack();
    } else if (step == 0) {
      props.setMnemonic("");
    } else if (step == 1 && props.mnemonic == "") {
      console.log("creating mnemonic");
      uiCreateMnemonic();
    } else if (step == 2) {
      props.setMnemonicToVerify("");
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
    if (props.mnemonic.localeCompare(props.mnemonicToVerify) == 0) {
      setMnemonicValidationError(false);
      props.onStepForward();
    } else {
      setMnemonicValidationError(true);
      setStep(step-1); // back to 3
    }
  }

  const uiCreateMnemonic = () => {
    console.log("Generating mnemonic...");

    setGenerateError(false);
    setGenerateErrorMsg("");

    createMnemonic('english').then((mnemonic) => {
      props.setMnemonic(mnemonic);
    }).catch((error) => {
      setStep(0);
      const errorMsg = ('stderr' in error) ? error.stderr : error.message;
      setGenerateError(true);
      setGenerateErrorMsg(errorMsg);
    })
  }

  const content = () => {
    switch(step) {
      case 0: return (
        <GenerateMnemonic setGenerateError={setGenerateError} generateError={generateError} setGenerateErrorMsg={setGenerateErrorMsg} generateErrorMsg={generateErrorMsg} />
      );
      case 1: case 2: return (
        <ShowMnemonic showCopyWarning={step === 2} mnemonic={props.mnemonic} network={props.network} />
      );
      case 3: return (
        <VerifyMnemonic
          setMnemonicToVerify={props.setMnemonicToVerify}
          mnemonicToVerify={props.mnemonicToVerify}
          error={mnemonicValidationError}
          onVerifyMnemonic={verifyMnemonic}
          network={props.network}
          mnemonic={props.mnemonic}
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
        disableBack={disableNext()}
        disableNext={disableNext()}
      />
    </Grid>
  );
}

export default MnemonicGenerationWizard;
