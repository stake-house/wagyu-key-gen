import React, { FC, ReactElement, useState } from 'react';
import { ipcRenderer } from 'electron';
import { useParams, useHistory } from "react-router-dom";
import { Stepper, Step, StepLabel, Grid, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { StepKey } from '../types';
import MnemonicGenerationWizard from "../components/MnemonicGenerationWizard";
import MnemonicImport from "../components/MnemonicImport";
import KeyConfigurationWizard from "../components/KeyConfigurationWizard";
import KeyGenerationWizard from "../components/KeyGenerationWizard";
import Finish from '../components/Finish';
import { stepLabels } from '../constants';
import { Network, StepSequenceKey } from '../types';

const stepSequenceMap: Record<string, StepKey[]> = {
  mnemonicimport: [
    StepKey.MnemonicImport,
    StepKey.KeyConfiguration,
    StepKey.KeyGeneration,
    StepKey.Finish
  ],
  mnemonicgeneration: [
    StepKey.MnemonicGeneration,
    StepKey.KeyConfiguration,
    StepKey.KeyGeneration,
    StepKey.Finish
  ]
}

const MainGrid = styled(Grid)`
  width: 100%;
  margin: 0px;
  text-align: center;
`;

const StyledStepper = styled(Stepper)`
  background-color: transparent;
`

type RouteParams = {
  stepSequenceKey: StepSequenceKey;
};

type WizardProps = {
  network: Network
}

const Wizard: FC<WizardProps> = (props): ReactElement => {
  const { stepSequenceKey } = useParams<RouteParams>();
  const history = useHistory();
  const initialKeyGenerationStartIndex =
    stepSequenceKey === StepSequenceKey.MnemonicGeneration ? 0 : null;

  const [mnemonic, setMnemonic] = useState("");
  const [verifyMnemonic, setVerifyMnemonic] = useState("");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [keyGenerationStartIndex, setKeyGenerationStartIndex] = useState(initialKeyGenerationStartIndex);
  const [numberOfKeys, setNumberOfKeys] = useState(1);
  const [password, setPassword] = useState("");
  const [folderPath, setFolderPath] = useState("");

  const stepSequence = stepSequenceMap[stepSequenceKey];
  const activeStepKey = stepSequence[activeStepIndex];
  
  const onStepForward = () => {
    if (activeStepIndex === stepSequence.length - 1) {
      ipcRenderer.send("close");
      return;
    }
    setActiveStepIndex(activeStepIndex + 1);
  }

  const onStepBack = () => {
    if (activeStepIndex === 0) {
      history.push("/");
    } else {
      setActiveStepIndex(activeStepIndex - 1);
    }
  }

  const stepper = (
    <Grid item>
      <StyledStepper activeStep={activeStepIndex} alternativeLabel>
        {stepSequence.map((stepKey: StepKey) => (
          <Step key={stepKey}>
            <StepLabel>{stepLabels[stepKey]}</StepLabel>
          </Step>
        ))}
      </StyledStepper>
    </Grid>
  );

  const commonProps = {
    onStepForward,
    onStepBack,
    children: stepper
  };

  const stepComponentSwitch = (): ReactElement => {
    switch(activeStepKey) {
      case StepKey.MnemonicImport:
        return (
          <MnemonicImport {...{ ...commonProps, mnemonic, setMnemonic }} />
        );
      case StepKey.MnemonicGeneration:
        return (
          <MnemonicGenerationWizard {...{ ...commonProps, mnemonic, setMnemonic, verifyMnemonic, setVerifyMnemonic }} />
        );
      case StepKey.KeyConfiguration:
        return (
          <KeyConfigurationWizard
            {...commonProps}
            keyGenerationStartIndex={keyGenerationStartIndex}
            initialKeyGenerationStartIndex={initialKeyGenerationStartIndex}
            setKeyGenerationStartIndex={setKeyGenerationStartIndex}
            showKeyGenerationStartIndexInput={initialKeyGenerationStartIndex == null}
            numberOfKeys={numberOfKeys}
            setNumberOfKeys={setNumberOfKeys}
            password={password}
            setPassword={setPassword}
          />
        );
        case StepKey.KeyGeneration:
          return (
            <KeyGenerationWizard
              {...commonProps}
              mnemonic={mnemonic}
              network={props.network}
              keyGenerationStartIndex={keyGenerationStartIndex}
              numberOfKeys={numberOfKeys}
              password={password}
              folderPath={folderPath}
              setFolderPath={setFolderPath}
            />
          );
        case StepKey.Finish:
          return (
            <Finish
              {...commonProps}
              folderPath={folderPath}
              setFolderPath={setFolderPath}
              network={props.network}
            />
          )
      default:
        return <div>No component for this step</div>
    }
  }

  return (
    <MainGrid container spacing={5} direction="column">
      <Grid item container>
        <Grid item xs={10}/>
        <Grid item xs={2}>
          <Typography variant="caption" style={{color: "gray"}}>
            Network: {props.network}
          </Typography>
        </Grid>
      </Grid>
      <Grid item container>
        {stepComponentSwitch()}
      </Grid>
    </MainGrid>
  );
}

export default Wizard;
