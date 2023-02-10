import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import KeyInputs from './KeyGeneratioinFlow/0-KeyInputs';
import VerifyKeysPassword from './KeyGeneratioinFlow/1-VerifyKeysPassword';
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  keyGenerationStartIndex: number,
  initialKeyGenerationStartIndex: number,
  setKeyGenerationStartIndex: Dispatch<SetStateAction<number>>,
  showKeyGenerationStartIndexInput: boolean,
  numberOfKeys: number,
  setNumberOfKeys: Dispatch<SetStateAction<number>>,
  withdrawalAddress: string,
  setWithdrawalAddress: Dispatch<SetStateAction<string>>,
  password: string,
  setPassword: Dispatch<SetStateAction<string>>,
  showAdvanced: boolean,
  setShowAdvanced: Dispatch<SetStateAction<boolean>>
}

/**
 * This is the wizard the user will navigate to configure their keys.
 * It uses the notion of a 'step' to render specific pages within the flow.
 * 
 * @param props.onStepBack function to execute when stepping back
 * @param props.onStepForward function to execute when stepping forward
 * @param props.keyGenerationStartIndex the index at which to start generating keys for the user
 * @param props.initialKeyGenerationStartIndex the default value for starting index
 * @param props.setKeyGenerationStartIndex function to set the starting index
 * @param props.showKeyGenerationStartIndexInput toggle to control whether we will prompt the user for starting index.
 *    Prompting the user for starting index is only required when importing a mnemonic.
 * @param props.numberOfKeys the total number of keys to generate for the user
 * @param props.setNumberOfKeys function to set the number of keys to generate
 * @param props.withdrawalAddress the optional wallet address for the withdrawal credentials
 * @param props.setWithdrawalAddress function to set the wallet address for the withdrawal credentials
 * @param props.password the password to use to protect the keys for the user
 * @param props.setPassword function to set the password
 * @returns the react element to render
 */
const KeyConfigurationWizard: FC<Props> = (props): ReactElement => {
  const [step, setStep] = useState(0);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [numberOfKeysError, setNumberOfKeysError] = useState(false);
  const [withdrawalAddressFormatError, setWithdrawalAddressFormatError] = useState(false);
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
        setWithdrawalAddressFormatError(false);
        setPasswordStrengthError(false);
        setStartingIndexError(false);
        props.setShowAdvanced(false);
        props.setPassword("");
        props.setKeyGenerationStartIndex(props.initialKeyGenerationStartIndex);
        props.setNumberOfKeys(1);
        props.setWithdrawalAddress("");
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
        console.log("Key configuration step is greater than 1 when prev was clicked.  This should never happen.");
        break;
      }
    }
  }

  const nextLabel = () => {
    switch (step) {
      case 0:
        return "Next";
      case 1:
        return "Next";
    }
  }

  const nextClicked = () => {
    switch (step) {

      // Inputs
      case 0: {
        validateInputs();
        break;
      }

      // Verify Password
      case 1: {
        confirmPassword();
        break;
      }

      default: {
        console.log("Key configuration step is greater than 1 when next was clicked.  This should never happen.");
        break;
      }
    }
  }

  const validateInputs = () => {
    let isError = false;

    if (props.numberOfKeys < 1 || props.numberOfKeys > 1000) {
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
    
    if (props.keyGenerationStartIndex < 0) {
      setStartingIndexError(true);
      isError = true;
    } else {
      setStartingIndexError(false);
    }

    if (props.withdrawalAddress != "" && props.showAdvanced) {
      if (!window.web3Utils.isAddress(props.withdrawalAddress)) {
        setWithdrawalAddressFormatError(true);
        isError = true;
      } else {
        setWithdrawalAddressFormatError(false);
      }
    } else {
      setWithdrawalAddressFormatError(false);
    }

    if (!isError) {
      setStep(step + 1);
    }
  }

  const confirmPassword = () => {
    if (props.password.localeCompare(verifyPassword) == 0) {
      setPasswordVerifyError(false);
      props.onStepForward();
    } else {
      setPasswordVerifyError(true);
    }
  }

  const content = () => {
    switch(step) {
      case 0: return (
        <KeyInputs
          numberOfKeys={props.numberOfKeys}
          setNumberOfKeys={props.setNumberOfKeys}
          withdrawalAddress={props.withdrawalAddress}
          setWithdrawalAddress={props.setWithdrawalAddress}
          index={props.keyGenerationStartIndex}
          setIndex={props.setKeyGenerationStartIndex}
          showIndexInput={props.showKeyGenerationStartIndexInput}
          password={props.password}
          setPassword={props.setPassword}
          numberOfKeysError={numberOfKeysError}
          withdrawalAddressFormatError={withdrawalAddressFormatError}
          setWithdrawalAddressFormatError={setWithdrawalAddressFormatError}
          passwordStrengthError={passwordStrengthError}
          startingIndexError={startingIndexError}
          showAdvanced={props.showAdvanced}
          setShowAdvanced={props.setShowAdvanced}
          onFinish={validateInputs}
        />
      );
      case 1: return (
        <VerifyKeysPassword
          setVerifyPassword={setVerifyPassword}
          passwordVerifyError={passwordVerifyError}
          onFinish={confirmPassword}
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
          Create Keys
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
      />
    </Grid>
  );
}

export default KeyConfigurationWizard;