import { Button, TextField, Tooltip, Typography } from "@mui/material";
import WizardWrapper from "../components/WizardWrapper";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ConfigureExistingPath, CreateKeysCreatePath, CreateKeysExistingPath, CreateMnemonicFlow, CreatePath, ExistingImportPath, ExistingMnemonicFlow, errors, tooltips } from "../constants";
import { KeyCreationContext } from "../KeyCreationContext";

const ConfigureValidatorKeys = () => {
  const {
    mnemonic,
    setIndex,
    setNumberOfKeys,
    setPassword,
    setWithdrawalAddress,
  } = useContext(KeyCreationContext);
  const history = useHistory();
  const usingExistingFlow = history.location.pathname === ConfigureExistingPath;

  const [passwordToVerify, setPasswordToVerify] = useState("");
  const [verifyPassword, setVerifyPassword] = useState(false);
  const [passwordVerifyError, setPasswordVerifyError] = useState(false);

  const [inputNumberOfKeys, setInputNumberOfKeys] = useState(1);
  const [inputNumberOfKeysError, setInputNumberOfKeysError] = useState(false);

  const [inputIndex, setInputIndex] = useState(0);
  const [inputIndexError, setInputIndexError] = useState(false);

  const [inputPassword, setInputPassword] = useState("");
  const [inputPasswordStrengthError, setInputPasswordStrengthError] = useState(false);

  const [inputWithdrawalAddress, setInputWithdrawalAddress] = useState("");
  const [inputWithdrawalAddressFormatError, setInputWithdrawalAddressFormatError] = useState(false);

  useEffect(() => {
    if (!mnemonic) {
      history.replace(usingExistingFlow ? ExistingImportPath : CreatePath);
    }
  }, []);

  const updateinputNumberOfKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    setInputNumberOfKeys(num);
  };

  const updateinputIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    setInputIndex(num);
  };

  const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPassword(e.target.value);
  };

  const updateEth1WithdrawAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputWithdrawalAddress(e.target.value.trim());
  };

  const validateInputs = async () => {
    let isError = false;

    if (inputNumberOfKeys < 1 || inputNumberOfKeys > 1000) {
      setInputNumberOfKeysError(true);
      isError = true;
    } else {
      setInputNumberOfKeysError(false);
    }

    if (inputPassword.length < 8) {
      setInputPasswordStrengthError(true);
      isError = true;
    } else {
      setInputPasswordStrengthError(false);
    }

    if (inputIndex < 0) {
      setInputIndexError(true);
      isError = true;
    } else {
      setInputIndexError(false);
    }

    if (inputWithdrawalAddress != "") {
      const isValidAddress = await window.web3Utils.isAddress(inputWithdrawalAddress);
      if (!isValidAddress) {
        setInputWithdrawalAddressFormatError(true);
        isError = true;
      } else {
        setInputWithdrawalAddressFormatError(false);
      }
    } else {
      setInputWithdrawalAddressFormatError(false);
    }

    if (!isError) {
      setVerifyPassword(true);
    }
  };

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      onNextClick();
    }
  };

  const checkPassword = () => {
    if (inputPassword.localeCompare(passwordToVerify) == 0) {
      setPasswordVerifyError(false);

      // Set context
      setIndex(inputIndex);
      setNumberOfKeys(inputNumberOfKeys);
      setPassword(inputPassword);
      setWithdrawalAddress(inputWithdrawalAddress);

      history.push(usingExistingFlow ? CreateKeysExistingPath : CreateKeysCreatePath);
    } else {
      setPasswordVerifyError(true);
    }
  };

  const onBackClick = () => {
    if (verifyPassword) {
      // Reset form
      setPasswordToVerify("");
      setVerifyPassword(false);
      setPasswordVerifyError(false);
      setInputNumberOfKeys(1);
      setInputIndex(0);
      setInputPassword("");
      setInputWithdrawalAddress("");

      // Reset context
      setIndex(0);
      setNumberOfKeys(1);
      setPassword("");
      setWithdrawalAddress("");
    } else {
      history.goBack();
    }
  };

  const onNextClick = () => {
    if (verifyPassword) {
      checkPassword();
    } else {
      validateInputs();
    }
  };


  return (
    <WizardWrapper
      actionBarItems={[
        <Button variant="contained" color="primary" onClick={() => onBackClick()} tabIndex={3}>Back</Button>,
        <Button variant="contained" color="primary" onClick={() => onNextClick()} tabIndex={2}>Next</Button>,
      ]}
      activeTimelineIndex={1}
      timelineItems={usingExistingFlow ? ExistingMnemonicFlow : CreateMnemonicFlow}
      title="Create Keys"
    >
      { verifyPassword ? (
        <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center">
          <div>Just to be sure...</div>

          <TextField
            className="tw-mt-12 tw-w-[300px]"
            id="password"
            label="Retype Password"
            type="password"
            variant="outlined"
            autoFocus
            onChange={(e) => setPasswordToVerify(e.target.value)}
            onKeyDown={handleKeyDown}
            error={passwordVerifyError}
            helperText={passwordVerifyError ? errors.PASSWORD_MATCH : ""}
          />
        </div>
      ): (
        <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center tw-px-20">
          <div className="tw-mb-4">Nice! Your Secret Recovery Phrase is verified. Now let's collect some info about the keys to create:</div>

          <div className="tw-w-full tw-flex tw-flex-row tw-gap-4">
            <Tooltip title={tooltips.NUMBER_OF_KEYS}>
              <TextField
                autoFocus
                className="tw-flex-grow"
                id="number-of-keys"
                label="Number of New Keys"
                variant="outlined"
                type="number"
                value={inputNumberOfKeys}
                onChange={updateinputNumberOfKeys}
                InputProps={{ inputProps: { min: 1, max: 1000 } }}
                error={inputNumberOfKeysError}
                helperText={ inputNumberOfKeysError ? errors.NUMBER_OF_KEYS : ""}
              />
            </Tooltip>

            {usingExistingFlow && (
              <Tooltip title={tooltips.STARTING_INDEX}>
                <TextField
                  className="tw-flex-grow"
                  id="inputindex"
                  label="Amount of Existing (starting inputindex)"
                  variant="outlined"
                  type="number"
                  value={inputIndex}
                  onChange={updateinputIndex}
                  InputProps={{ inputProps: { min: 1, max: 1000 } }}
                  error={inputIndexError}
                  helperText={inputIndexError ? errors.STARTING_INDEX : ""}
                />
            </Tooltip>
            )}

            <Tooltip title={tooltips.PASSWORD}>
              <TextField
                className="tw-flex-grow"
                id="password"
                label="Password"
                type="password"
                variant="outlined"
                value={inputPassword}
                onChange={updatePassword}
                error={inputPasswordStrengthError}
                helperText={inputPasswordStrengthError ? errors.PASSWORD_STRENGTH : ""}
              />
            </Tooltip>
          </div>

          <Tooltip title={tooltips.ETH1_WITHDRAW_ADDRESS}>
            <TextField
              className="tw-mt-8 tw-w-[440px]"
              id="eth1-withdraw-address"
              label="Ethereum Withdrawal Address (Optional)"
              variant="outlined"
              value={inputWithdrawalAddress}
              onChange={updateEth1WithdrawAddress}
              error={inputWithdrawalAddressFormatError}
              helperText={ inputWithdrawalAddressFormatError ? errors.ADDRESS_FORMAT_ERROR : ""}
            />
          </Tooltip>
          <Typography className="tw-text-center tw-mx-4" variant="body1">
            Please ensure that you have control over this address. If you do not add a withdrawal address now, you will be able to add one later with your 24 words secret recovery phrase.
          </Typography>
        </div>
      )}
    </WizardWrapper>
  );
};

export default ConfigureValidatorKeys;
