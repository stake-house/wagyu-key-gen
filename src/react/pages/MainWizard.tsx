import React, { FC, ReactElement, useState } from 'react';
import { useParams, useHistory } from "react-router-dom";
import { Stepper, Step, StepLabel, Grid, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { Keystore, StepKey } from '../types';
import MnemonicGenerationWizard from "../components/MnemonicGenerationWizard";
import MnemonicImport from "../components/MnemonicImport";
import KeyConfigurationWizard from "../components/KeyConfigurationWizard";
import KeyGenerationWizard from "../components/KeyGenerationWizard";
import Finish from '../components/Finish';
import BTECConfigurationWizard from "../components/BTECConfigurationWizard";
import BTECGenerationWizard from "../components/BTECGenerationWizard";
import FinishBTEC from '../components/FinishBTEC';
import { stepLabels } from '../constants';
import { Network, StepSequenceKey } from '../types';
import VersionFooter from '../components/VersionFooter';
import ExitTransactionConfigurationWizard from '../components/ExitTransactionConfigurationWizard';
import ExitTransactionGenerationWizard from '../components/ExitTransactionGenerationWizard';
import FinishExitTransaction from '../components/FinishExitTransaction';

const stepSequenceMap: Record<StepSequenceKey, StepKey[]> = {
  [StepSequenceKey.MnemonicImport]: [
    StepKey.MnemonicImport,
    StepKey.KeyConfiguration,
    StepKey.KeyGeneration,
    StepKey.Finish
  ],
  [StepSequenceKey.MnemonicGeneration]: [
    StepKey.MnemonicGeneration,
    StepKey.KeyConfiguration,
    StepKey.KeyGeneration,
    StepKey.Finish
  ],
  [StepSequenceKey.BLSToExecutionChangeGeneration]: [
    StepKey.MnemonicImport,
    StepKey.BTECConfiguration,
    StepKey.BTECGeneration,
    StepKey.FinishBTEC
  ],
  [StepSequenceKey.PreSignExitTransactionGeneration]: [
    StepKey.ExitTransactionConfiguration,
    StepKey.ExitTransactionGeneration,
    StepKey.FinishExitTransaction
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

/**
 * This is the main wizard through which each piece of functionality for the app runs.
 * 
 * This wizard manages the global stepper showing the user where they are in the process.
 * 
 * @param props passed in data for the component to use
 * @returns the react element to render
 */
const Wizard: FC<WizardProps> = (props): ReactElement => {
  const { stepSequenceKey } = useParams<RouteParams>();
  const history = useHistory();

  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicToVerify, setMnemonicToVerify] = useState("");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [numberOfKeys, setNumberOfKeys] = useState(1);
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [password, setPassword] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [btecIndices, setBtecIndices] = useState("");
  const [btecCredentials, setBtecCredentials] = useState("");
  const [epoch, setEpoch] = useState(0);
  const [keystores, setKeystores] = useState<Keystore[]>([]);
  const [exitInputFolderPath, setExitInputFolderPath] = useState("");
  const [exitOutputFolderPath, setExitOutputFolderPath] = useState("");


  const stepSequence = stepSequenceMap[stepSequenceKey];
  const activeStepKey = stepSequence[activeStepIndex];
  
  const onStepForward = () => {
    if (activeStepIndex === stepSequence.length - 1) {
      window.electronAPI.ipcRendererSendClose();
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

  /**
   * This is the UI stepper component rendering where the user is in the process
   */
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

  /**
   * This switch returns the correct react components based on the active step.
   * @returns the component to render
   */
  const stepComponentSwitch = (): ReactElement => {
    switch(activeStepKey) {
      case StepKey.MnemonicImport:
        return (
          <MnemonicImport {...{ ...commonProps, mnemonic, setMnemonic }} />
        );
      case StepKey.MnemonicGeneration:
        return (
          <MnemonicGenerationWizard
            {...{ ...commonProps, mnemonic, setMnemonic, mnemonicToVerify, setMnemonicToVerify }}
            network={props.network} />
        );
      case StepKey.KeyConfiguration:
        return (
          <KeyConfigurationWizard
            {...commonProps}
            keyGenerationStartIndex={startIndex}
            initialKeyGenerationStartIndex={0}
            setKeyGenerationStartIndex={setStartIndex}
            showKeyGenerationStartIndexInput={stepSequenceKey === StepSequenceKey.MnemonicImport}
            numberOfKeys={numberOfKeys}
            setNumberOfKeys={setNumberOfKeys}
            withdrawalAddress={withdrawalAddress}
            setWithdrawalAddress={setWithdrawalAddress}
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
            keyGenerationStartIndex={startIndex}
            numberOfKeys={numberOfKeys}
            withdrawalAddress={withdrawalAddress}
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
            network={props.network}
          />
        );
      case StepKey.BTECConfiguration:
        return (
          <BTECConfigurationWizard
            {...commonProps}
            network={props.network}
            mnemonic={mnemonic}
            startIndex={startIndex}
            setStartIndex={setStartIndex}
            btecIndices={btecIndices}
            setBtecIndices={setBtecIndices}
            btecCredentials={btecCredentials}
            setBtecCredentials={setBtecCredentials}
            withdrawalAddress={withdrawalAddress}
            setWithdrawalAddress={setWithdrawalAddress}
          />
        );
      case StepKey.BTECGeneration:
        return (
          <BTECGenerationWizard
            {...commonProps}
            mnemonic={mnemonic}
            network={props.network}
            startIndex={startIndex}
            withdrawalAddress={withdrawalAddress}
            btecIndices={btecIndices}
            btecCredentials={btecCredentials}
            folderPath={folderPath}
            setFolderPath={setFolderPath}
          />
        );
      case StepKey.FinishBTEC:
        return (
          <FinishBTEC
            {...commonProps}
            folderPath={folderPath}
            network={props.network}
          />
        );
      case StepKey.ExitTransactionConfiguration:
        return (
          <ExitTransactionConfigurationWizard
            {...commonProps} 
            epoch={epoch}
            setEpoch={setEpoch}
            keystores={keystores}
            setKeystores={setKeystores}
            inputFolderPath={exitInputFolderPath}
            setInputFolderPath={setExitInputFolderPath}
            outputFolderPath={exitOutputFolderPath}
            setOutputFolderPath={setExitOutputFolderPath}
          />
        );
      case StepKey.ExitTransactionGeneration:
        return (
          <ExitTransactionGenerationWizard
            {...commonProps}
            epoch={epoch}
            folderPath={exitOutputFolderPath}
            setFolderPath={setExitOutputFolderPath}
            keystores={keystores}
            network={props.network}
          />
        )
      case StepKey.FinishExitTransaction:
        return (
          <FinishExitTransaction
            {...commonProps}
            folderPath={exitOutputFolderPath}
          />
        )
      default:
        return <div>No component for this step</div>
    }
  }

  return (
    <MainGrid container spacing={3} direction="column">
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
      <VersionFooter />
    </MainGrid>
  );
}

export default Wizard;
