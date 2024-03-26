import { Button, TextField, Tooltip, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { BTECContext } from "../BTECContext";
import Loader from "../components/Loader";
import WizardWrapper from "../components/WizardWrapper";
import { BTECFlow, errors, paths, tooltips } from "../constants";
import { GlobalContext } from "../GlobalContext";

/**
 * Form to provide start index, validator indices, current withdrawal credentials, and the
 * desired withdrawal address to be set.
 */
const ConfigureWithdrawalAddress = () => {
  const {
    btecCredentials,
    setBTECCredentials,
    btecIndices,
    setBTECIndices,
    index,
    setIndex,
    mnemonic,
    withdrawalAddress,
    setWithdrawalAddress
  } = useContext(BTECContext);
  const { network } = useContext(GlobalContext);
  const history = useHistory();

  const [inputIndex, setInputIndex] = useState(index);
  const [indexError, setIndexError] = useState("");
  const [inputIndices, setInputIndices] = useState(btecIndices);
  const [indicesError, setIndicesError] = useState("");
  const [inputCredentials, setInputCredentials] = useState(btecCredentials);
  const [credentialsError, setCredentialsError] = useState("");
  const [inputWithdrawalAddress, setInputWithdrawalAddress] = useState(withdrawalAddress);
  const [withdrawalAddressError, setWithdrawalAddressError] = useState("");

  const [validatingCredentials, setValidatingCredentials] = useState(false);

  useEffect(() => {
    if (!mnemonic) {
      history.replace(paths.BTEC_IMPORT);
    }
  }, []);

  const updateIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    setInputIndex(num);
  };

  const updateIndices = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputIndices(e.target.value.trim());
  };

  const updateBTECCredentials = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCredentials(e.target.value.trim());
  };

  const updateEth1WithdrawAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputWithdrawalAddress(e.target.value.trim());
  };

  /**
   * Three step function:
   *  - Validate all inputs and make sure there are no errors
   *  - If no errors, validate the provided BLS credentials
   *  - If successful, send user to the creation step
   *
   * Any errors the user will be provided a corresponding error message
   */
  const validateInputs = async () => {
    let isError = false;

    if (inputIndex < 0) {
      setIndexError(errors.NON_NEGATIVE_INDEX);
      isError = true;
    } else {
      setIndexError("");
    }

    const splitIndices = inputIndices.split(',');
    const splitBLSCredentials = inputCredentials.split(',');

    if (inputIndices === "") {
      setIndicesError(errors.INDICES);
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
        setIndicesError(errors.INDICES_FORMAT);
        isError = true;
      } else {
        setIndicesError("");
      }
    }

    if (inputCredentials === "") {
      setCredentialsError(errors.BLS_CREDENTIALS);
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
        setCredentialsError(errors.BLS_CREDENTIALS_FORMAT);
        isError = true;
      } else {
        setCredentialsError("");
      }
    }

    // Validate indices length matches credentials length
    if (splitIndices.length !== splitBLSCredentials.length) {
      setIndicesError(errors.INDICES_LENGTH);
      isError = true;
    }

    if (inputWithdrawalAddress !== "") {
      const isValidAddress = await window.web3Utils.isAddress(inputWithdrawalAddress);
      if (!isValidAddress) {
        setWithdrawalAddressError(errors.ADDRESS_FORMAT_ERROR);
        isError = true;
      } else {
        setWithdrawalAddressError("");
      }
    } else {
      setWithdrawalAddressError(errors.WITHDRAW_ADDRESS_REQUIRED);
      isError = true;
    }

    if (!isError) {
      setValidatingCredentials(true);

      window.eth2Deposit.validateBLSCredentials(network, mnemonic, inputIndex, inputCredentials).then(() => {
        setBTECCredentials(inputCredentials);
        setBTECIndices(inputIndices);
        setIndex(inputIndex);
        setWithdrawalAddress(inputWithdrawalAddress);

        history.push(paths.CREATE_CREDENTIALS);
      }).catch(() => {
        setValidatingCredentials(false);
        setCredentialsError(errors.BLS_CREDENTIALS_NO_MATCH);
      })
    }
  };

  const onBackClick = () => {
    setBTECCredentials("");
    setBTECIndices("");
    setIndex(0);
    setWithdrawalAddress("");
    history.goBack();
  };

  const onNextClick = () => {
    validateInputs();
  };

  return (
    <WizardWrapper
      actionBarItems={[
        <Button variant="contained" color="primary" disabled={validatingCredentials} onClick={() => onBackClick()} tabIndex={3}>Back</Button>,
        <Button variant="contained" color="primary" disabled={validatingCredentials} onClick={() => onNextClick()} tabIndex={2}>Next</Button>,
      ]}
      activeTimelineIndex={1}
      timelineItems={BTECFlow}
      title="Generate BLS to execution change"
    >
      { validatingCredentials ? (
        <Loader message="Validating BLS credentials..." />
      ) : (
      <div className="tw-flex tw-flex-col tw-gap-4 tw-mx-16">
        <div className="tw-flex tw-flex-row tw-gap-4">
          <Tooltip title={tooltips.BTEC_START_INDEX}>
            <TextField
              className="tw-w-[200px]"
              id="index"
              label="Start index"
              variant="outlined"
              type="number"
              value={inputIndex}
              onChange={updateIndex}
              InputProps={{ inputProps: { min: 0 } }}
              error={!!indexError}
              helperText={indexError}
              required
            />
          </Tooltip>

          <Tooltip title={tooltips.BTEC_INDICES}>
            <TextField
              className="tw-flex-grow"
              id="indices"
              label="Indices or validator indexes (comma separated)"
              variant="outlined"
              type="string"
              value={inputIndices}
              onChange={updateIndices}
              error={!!indicesError}
              helperText={indicesError}
              required
            />
          </Tooltip>
        </div>

        <Tooltip title={tooltips.BLS_CREDENTIALS}>
          <TextField
            className="tw-mx-20"
            multiline
            minRows="3"
            id="bls-credentials"
            label="BLS withdrawal credentials (comma separated)"
            variant="outlined"
            value={inputCredentials}
            onChange={updateBTECCredentials}
            error={!!credentialsError}
            helperText={credentialsError}
            required
          />
        </Tooltip>

        <div className="tw-text-center">
          <Tooltip title={tooltips.BTEC_WITHDRAW_ADDRESS}>
            <TextField
              className="tw-w-[440px]"
              id="eth1-withdraw-address"
              label="Ethereum Withdrawal Address"
              variant="outlined"
              value={inputWithdrawalAddress}
              onChange={updateEth1WithdrawAddress}
              error={!!withdrawalAddressError}
              helperText={ withdrawalAddressError}
              required
            />
          </Tooltip>
          <Typography className="tw-mt-2" variant="body1">
            Please ensure that you have control over this address.
          </Typography>
        </div>
      </div>
      )}
    </WizardWrapper>
  )
};

export default ConfigureWithdrawalAddress;

