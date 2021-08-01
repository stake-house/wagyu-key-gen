import React, { FC, ReactElement, useState } from 'react';
import { ipcRenderer } from 'electron';
import { RouteComponentProps, useParams, useHistory } from "react-router-dom";
import { Stepper, Step, StepLabel, Grid, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { StepKey } from '../types';
import MnemonicGenerationWizard from "../components/MnemonicGenerationWizard";
import MnemonicImport from "../components/MnemonicImport";
import KeyConfigurationWizard from "../components/KeyConfigurationWizard";
import KeyGenerationWizard from "../components/KeyGenerationWizard";
import Finish from '../components/Finish';
import { stepLabels } from '../constants';

type IncomingState = {
  network: string,
}

type RouteParams = {
  stepSequenceKey: string;
};

type Props = RouteComponentProps<RouteParams, any, IncomingState>;

const stepSequenceMap: Record<string, StepKey[]> = {
  mnemonicimport: [
    StepKey.mnemonicImport,
    StepKey.keyConfiguration,
    StepKey.keyGeneration,
    StepKey.finish
  ],
  mnemonicgeneration: [
    StepKey.mnemonicGeneration,
    StepKey.keyConfiguration,
    StepKey.keyGeneration,
    StepKey.finish
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

const Wizard: FC<Props> = (props): ReactElement => {
  const { stepSequenceKey } = useParams<RouteParams>();
  const history = useHistory();
  const initialKeyGenerationStartIndex =
    stepSequenceKey === 'mnemonicgeneration' ? 0 : null;

  const [mnemonic, setMnemonic] = useState("");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [keyGenerationStartIndex, setKeyGenerationStartIndex] = useState(initialKeyGenerationStartIndex);
  const [numberOfKeys, setNumberOfKeys] = useState(0);
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
    <StyledStepper activeStep={activeStepIndex} alternativeLabel>
      {stepSequence.map((stepKey: StepKey) => (
        <Step key={stepKey}>
          <StepLabel>{stepLabels[stepKey]}</StepLabel>
        </Step>
      ))}
    </StyledStepper>
  );

  const commonProps = {
    onStepForward,
    onStepBack,
    children: stepper
  };

  const stepComponentSwitch = (): ReactElement => {
    switch(activeStepKey) {
      case StepKey.mnemonicImport:
        return (
          <MnemonicImport {...{ ...commonProps, mnemonic, setMnemonic }} />
        );
      case StepKey.mnemonicGeneration:
        return (
          <MnemonicGenerationWizard {...{ ...commonProps, mnemonic, setMnemonic }} />
        );
      case StepKey.keyConfiguration:
        return (
          <KeyConfigurationWizard
            {...commonProps}
            keyGenerationStartIndex={keyGenerationStartIndex}
            setKeyGenerationStartIndex={setKeyGenerationStartIndex}
            numberOfKeys={numberOfKeys}
            setNumberOfKeys={setNumberOfKeys}
            password={password}
            setPassword={setPassword}
          />
        );
        case StepKey.keyGeneration:
          return (
            <KeyGenerationWizard
              {...commonProps}
              mnemonic={mnemonic}
              network={props.location.state.network}
              keyGenerationStartIndex={keyGenerationStartIndex}
              numberOfKeys={numberOfKeys}
              password={password}
              folderPath={folderPath}
              setFolderPath={setFolderPath}
            />
          );
        case StepKey.finish:
          return (
            <Finish
              {...commonProps}
              folderPath={folderPath}
              setFolderPath={setFolderPath}
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
            Network: {props.location.state.network}
          </Typography>
        </Grid>
      </Grid>
      <Grid item container>
        <Grid item xs={12}>
          {stepComponentSwitch()}
        </Grid>
      </Grid>
    </MainGrid>
  );
}

export default Wizard;
