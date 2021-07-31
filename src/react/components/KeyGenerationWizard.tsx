import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction, useState } from 'react';
import styled from 'styled-components';
import { uname } from '../commands/BashUtils';
import { generateKeys } from '../commands/Eth2Deposit';
import SelectFolder from './KeyGeneratioinFlow/2-SelectFolder';
import CreatingKeys from './KeyGeneratioinFlow/3-CreatingKeys';
import KeysCreated from './KeyGeneratioinFlow/4-KeysCreated';
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 350px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  network: string,
  mnemonic: string,
  keyGenerationStartIndex: number | null,
  numberOfKeys: number,
  password: string,
  folderPath: string,
  setFolderPath: Dispatch<SetStateAction<string>>,
}

const KeyGenerationWizard: FC<Props> = (props): ReactElement => {
  const [step, setStep] = useState(0);
  const [folderError, setFolderError] = useState(false);
  
  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Back";
      case 1:
        return ""; // no back button
    }
  }

  const prevClicked = () => {
    switch (step) {
      case 0: {
        props.setFolderPath("");
        setFolderError(false);
        props.onStepBack();
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
        return "Create";
      case 1:
        return ""; // no next button
    }
  }

  const nextClicked = () => {
    switch (step) {
      // Select Folder
      case 0: {
        if (props.folderPath != "") {
          setFolderError(false);
          setStep(step + 1);

          setTimeout(() => {
            handleKeyGeneration();
            // Move on to the last page when done
            props.onStepForward();
          }, 1000);

        } else {
          setFolderError(true);
        }

        break;
      }

      // Keys are being generated
      case 1: {
        // there is no next button here
        // step is autoincremented once keys are created
        break;
      }

      default: {
        console.log("This should never happen.")
        break;
      }

    }
  }

  const handleKeyGeneration = () => {
    const os = uname();
    const eth1_withdrawal_address = "";

    if (os == "Linux") {
      console.log("On linux, generating keys.");
      
      generateKeys(
        props.mnemonic,
        props.keyGenerationStartIndex!,
        props.numberOfKeys,
        props.network.toLowerCase(),
        props.password,
        eth1_withdrawal_address,
        props.folderPath
      );

    } else {
      console.log("Pretended to generate keys since not on linux.");

      // pause for a couple seconds
      const end = Date.now() + 2000;
      while (Date.now() < end) continue;
    }
  }

  const content = () => {
    switch(step) {
      case 0: return (
        <SelectFolder setFolderPath={props.setFolderPath} folderPath={props.folderPath} setFolderError={setFolderError} folderError={folderError} />
      );
      case 1: return (
        <CreatingKeys />
      );
      case 2: return (
<       KeysCreated folderPath={props.folderPath} />
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
        onStepBack={prevClicked}
        onStepForward={nextClicked}
        backLabel={prevLabel()}
        forwardLabel={nextLabel()}
        disableForward={!props.folderPath}
        hideBack={step === 1}
        hideForward={step === 1}
      />
    </Grid>
  );
}

export default KeyGenerationWizard;