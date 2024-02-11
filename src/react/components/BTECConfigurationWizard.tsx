import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { errors } from '../constants';
import MainInputs from './BTECGenerationFlow/0-MainInputs';
import ValidatingBLSCredentials from './BTECGenerationFlow/1-ValidatingBLSCredentials';
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  network: string,
  mnemonic: string,
  startIndex: number,
  setStartIndex: Dispatch<SetStateAction<number>>,
  btecIndices: string,
  setBtecIndices: Dispatch<SetStateAction<string>>,
  btecCredentials: string,
  setBtecCredentials: Dispatch<SetStateAction<string>>,
  withdrawalAddress: string,
  setWithdrawalAddress: Dispatch<SetStateAction<string>>,
}

/**
 * This is the wizard the user will navigate to configure their BLS to execution change.
 * It uses the notion of a 'step' to render specific pages within the flow.
 *
 * @param props.onStepBack function to execute when stepping back
 * @param props.onStepForward function to execute when stepping forward
 * @param props.network the network for which to generate this BTEC
 * @param props.mnemonic the current mnemonic for which to generate this BTEC
 * @param props.startIndex the index for the keys to start generating withdrawal credentials
 * @param props.setStartIndex function to set the starting index
 * @param props.btecIndices a list of the chosen validator index number(s) as identified on the beacon chain
 * @param props.setBtecIndices function to set the list of validator index number(s)
 * @param props.btecCredentials a list of the old BLS withdrawal credentials of the given validator(s)
 * @param props.setBtecCredentials function to set the list of old BLS withdrawal credentials
 * @param props.withdrawalAddress the wallet address for the withdrawal credentials
 * @param props.setWithdrawalAddress function to set the wallet address for the withdrawal credentials
 * @returns the react element to render
 */
const BTECConfigurationWizard: FC<Props> = (props): ReactElement => {
  const [step, setStep] = useState(0);
  const [withdrawalAddressError, setWithdrawalAddressError] = useState(false);
  const [withdrawalAddressErrorMsg, setWithdrawalAddressErrorMsg] = useState("");
  const [startingIndexError, setStartingIndexError] = useState(false);
  const [indicesError, setIndicesError] = useState(false);
  const [btecCredentialsError, setBtecCredentialsError] = useState(false);
  const [indicesErrorMsg, setIndicesErrorMsg] = useState("");
  const [btecCredentialsErrorMsg, setBtecCredentialsErrorMsg] = useState("");

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
        setWithdrawalAddressError(false);
        setWithdrawalAddressErrorMsg("");
        setStartingIndexError(false);
        setIndicesError(false);
        setIndicesErrorMsg("");
        setBtecCredentialsError(false);
        setBtecCredentialsErrorMsg("");
        props.setStartIndex(0);
        props.setBtecIndices("");
        props.setBtecCredentials("");
        props.setWithdrawalAddress("");
        props.onStepBack();
        break;
      }
      default: {
        console.log("BTEC configuration step is greater than 0 when prev was clicked.  This should never happen.");
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

      default: {
        console.log("BTEC configuration step is greater than 1 when next was clicked.  This should never happen.");
        break;
      }
    }
  }

  const validateInputs = async () => {
    let isError = false;

    if (props.startIndex < 0) {
      setStartingIndexError(true);
      isError = true;
    } else {
      setStartingIndexError(false);
    }

    const splitIndices = props.btecIndices.split(',');
    const splitBLSCredentials = props.btecCredentials.split(',');

    if (props.btecIndices == "") {
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

    if (props.btecCredentials == "") {
      setBtecCredentialsError(true);
      setBtecCredentialsErrorMsg(errors.BLS_CREDENTIALS);
      isError = true;
    } else {
      // Validate if all credentials match format

      let credentialFormatError = false;
      splitBLSCredentials.forEach( (credential) => {
        if (!/^(0x)?00[0-9a-fA-F]{62}$/.test(credential)) {
          credentialFormatError = true;
        }
      });

      if (credentialFormatError) {
        setBtecCredentialsError(true);
        setBtecCredentialsErrorMsg(errors.BLS_CREDENTIALS_FORMAT);
        isError = true;
      } else {
        setBtecCredentialsError(false);
      }
    }

    // Validate indices length matches credentials length
    if (splitIndices.length != splitBLSCredentials.length) {
      setIndicesError(true);
      setIndicesErrorMsg(errors.INDICES_LENGTH);
      isError = true;
    }

    if (props.withdrawalAddress != "") {
      const isValidAddress = await window.web3Utils.isAddress(props.withdrawalAddress);
      if (!isValidAddress) {
        setWithdrawalAddressError(true);
        setWithdrawalAddressErrorMsg(errors.ADDRESS_FORMAT_ERROR);
        isError = true;
      } else {
        setWithdrawalAddressError(false);
      }
    } else {
      setWithdrawalAddressError(true);
      setWithdrawalAddressErrorMsg(errors.WITHDRAW_ADDRESS_REQUIRED);
      isError = true;
    }

    if (!isError) {

      setStep(step + 1);

      window.eth2Deposit.validateBLSCredentials(props.network, props.mnemonic, props.startIndex, props.btecCredentials).then(() => {
        props.onStepForward();
      }).catch((error) => {
        setStep(0);

        setBtecCredentialsError(true);
        setBtecCredentialsErrorMsg(errors.BLS_CREDENTIALS_NO_MATCH);
      })
    }
  }

  const content = () => {
    switch(step) {
      case 0: return (
        <MainInputs
          index={props.startIndex}
          setIndex={props.setStartIndex}
          btecIndices={props.btecIndices}
          setBtecIndices={props.setBtecIndices}
          btecCredentials={props.btecCredentials}
          setBtecCredentials={props.setBtecCredentials}
          withdrawalAddress={props.withdrawalAddress}
          setWithdrawalAddress={props.setWithdrawalAddress}
          withdrawalAddressError={withdrawalAddressError}
          setWithdrawalAddressError={setWithdrawalAddressError}
          withdrawalAddressErrorMsg={withdrawalAddressErrorMsg}
          setWithdrawalAddressErrorMsg={setWithdrawalAddressErrorMsg}
          startingIndexError={startingIndexError}
          setStartingIndexError={setStartingIndexError}
          indicesError={indicesError}
          setIndicesError={setIndicesError}
          indicesErrorMsg={indicesErrorMsg}
          setIndicesErrorMsg={setIndicesErrorMsg}
          btecCredentialsError={btecCredentialsError}
          setBtecCredentialsError={setBtecCredentialsError}
          btecCredentialsErrorMsg={btecCredentialsErrorMsg}
          setBtecCredentialsErrorMsg={setBtecCredentialsErrorMsg}
          onFinish={validateInputs}
        />
      );
      case 1: return (
        <ValidatingBLSCredentials
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
        Generate BLS to execution change
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
        disableBack={step === 1}
        disableNext={step === 1}
      />
    </Grid>
  );
}

export default BTECConfigurationWizard;