import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { uname } from '../commands/BashUtils';
import { createMnemonic } from '../commands/Eth2Deposit';
import GenerateMnemonic from './MnemonicGenerationFlow/0-GenerateMnemonic';
import ShowMnemonic from './MnemonicGenerationFlow/1-2-ShowMnemonic';
import VerifyMnemonic from './MnemonicGenerationFlow/3-VerifyMnemonic';
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 325px;
  margin-top: 16px;
`;

type Props = {
  mnemonic: string,
  setMnemonic: Dispatch<SetStateAction<string>>,
  onStepBack: () => void,
  onStepForward: () => void
}

const MnemonicGenerationWizard: FC<Props> = (props): ReactElement => {
  const [step, setStep] = useState(0);
  const [verifyMnemonic, setVerifyMnemonic] = useState("");
  const [mnemonicValidationError, setMnemonicValidationError] = useState(false);

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
    switch (step) {
      case 0: {
        props.onStepBack();
        break;
      }
      case 1: {
        props.setMnemonic("");
        setStep(step - 1);
        break;
      }
      case 2: {
        setStep(step - 1);
        break;
      }
      case 3: {
        setVerifyMnemonic("");
        setMnemonicValidationError(false)
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
        return "Generate";
      case 1:
        return "Next";
      case 2:
        return "I'm sure";
      case 3:
        return "Verify";
    }
  }

  const nextClicked = () => {
    switch (step) {

      // GenerateMnemonic
      case 0: {
        uiCreateMnemonic();
        setStep(step + 1);
        break;
      }

      // ShowMnemonic
      case 1: {
        setStep(step + 1);
        break;
      }

      // I'm Sure
      case 2: {
        setStep(step + 1);
        break;
      }

      // VerifyMnemonic
      case 3: {
        if (props.mnemonic.localeCompare(verifyMnemonic) == 0) {
          setMnemonicValidationError(false);
          props.onStepForward();
        } else {
          setMnemonicValidationError(true);
        }
        break;
      }

      default: {
        console.log("This should never happen.")
        break;
      }

    }
  }

  const uiCreateMnemonic = () => {
    if (uname() == "Linux") {
      props.setMnemonic(createMnemonic('english'));
    } else {
      props.setMnemonic("one two three four five six seven eight nine ten eleven twelve one two three four five six seven eight nine ten eleven twelve");
    }
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
        <VerifyMnemonic setVerifyMnemonic={setVerifyMnemonic} error={mnemonicValidationError} />
      );
      default:
        return null;
    }
  }


  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
          Generate Mnemonic
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
      />
    </Grid>
  );
}

export default MnemonicGenerationWizard;
