import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import WizardWrapper from "../components/WizardWrapper";
import {
  CreateMnemonicFlow,
  ExistingMnemonicFlow,
  errors,
  paths,
  tooltips,
} from "../constants";
import { KeyCreationContext } from "../KeyCreationContext";

/**
 * Form to provide number of keys, index, password, and optional withdrawal address necessary to
 * complete the validator key creation process.
 *
 * User will provide the necessary inputs and a verification of the password will be done before
 * they can continue the flow
 */
const ConfigureValidatorKeys = () => {
  const {
    mnemonic,
    index,
    setIndex,
    numberOfKeys,
    setNumberOfKeys,
    amount,
    setAmount,
    password,
    setPassword,
    withdrawalAddress,
    setWithdrawalAddress,
    compounding,
    setCompounding,
  } = useContext(KeyCreationContext);
  const history = useHistory();
  const usingExistingFlow = history.location.pathname === paths.CONFIGURE_EXISTING;

  const [passwordToVerify, setPasswordToVerify] = useState("");
  const [verifyPassword, setVerifyPassword] = useState(false);
  const [passwordVerifyError, setPasswordVerifyError] = useState(false);

  const [inputNumberOfKeys, setInputNumberOfKeys] = useState(numberOfKeys);
  const [inputNumberOfKeysError, setInputNumberOfKeysError] = useState(false);

  const [inputIndex, setInputIndex] = useState(index);
  const [inputIndexError, setInputIndexError] = useState(false);

  const [inputAmount, setInputAmount] = useState(amount);
  const [inputAmountError, setInputAmountError] = useState(false);

  const [inputPassword, setInputPassword] = useState(password);
  const [inputPasswordStrengthError, setInputPasswordStrengthError] = useState(false);

  const [inputWithdrawalAddress, setInputWithdrawalAddress] = useState(withdrawalAddress);
  const [inputWithdrawalAddressFormatError, setInputWithdrawalAddressFormatError] = useState(false);

  const [inputCompounding, setInputCompounding] = useState(compounding);

  useEffect(() => {
    if (!mnemonic) {
      history.replace(usingExistingFlow ? paths.EXISTING_IMPORT : paths.CREATE_MNEMONIC);
    }
  }, []);

  const updateNumberOfKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    setInputNumberOfKeys(num);
  };

  const updateIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    setInputIndex(num);
  };

  const updateAmount = ({ target: { value }}: React.FocusEvent<HTMLInputElement>) => {
    let trimmedValue = value;
    const splitValue = value.split('.');
    if (splitValue.length > 1) {
      // Keep precision to 1 Gwei
      trimmedValue = `${splitValue[0]}.${splitValue[1].substring(0, 9)}`;
    }

    const num = parseFloat(trimmedValue);
    setInputAmount(num);
  };

  const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPassword(e.target.value);
  };

  const updateEth1WithdrawAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value.trim();
    setInputWithdrawalAddress(address);
    if (!address) {
      setInputCompounding(false);
      setInputAmount(32);
    }
  };

  const updateCompounding = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      setInputAmount(32);
    }

    setInputCompounding(e.target.checked);
  };

  /**
   * Validates each value simultaneously and if there are no errors will show the
   * user the password verification input
   */
  const validateInputs = async () => {
    let isError = false;

    if (inputNumberOfKeys < 1 || inputNumberOfKeys > 1000) {
      setInputNumberOfKeysError(true);
      isError = true;
    } else {
      setInputNumberOfKeysError(false);
    }

    if (inputIndex < 0) {
      setInputIndexError(true);
      isError = true;
    } else {
      setInputIndexError(false);
    }

    if (inputAmount < 1 || inputAmount > 2048) {
      setInputAmountError(true);
      isError = true;
    } else {
      setInputAmountError(false);
    }

    if (inputPassword.length < 12) {
      setInputPasswordStrengthError(true);
      isError = true;
    } else {
      setInputPasswordStrengthError(false);
    }

    if (inputWithdrawalAddress !== "") {
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

  /**
   * Verifies the passwords match and will move the user to the next step in the flow if so
   */
  const checkPassword = () => {
    if (inputPassword.localeCompare(passwordToVerify) == 0) {
      setPasswordVerifyError(false);

      // Set context
      setIndex(inputIndex);
      setNumberOfKeys(inputNumberOfKeys);
      setAmount(inputAmount);
      setPassword(inputPassword);
      setWithdrawalAddress(inputWithdrawalAddress);
      setCompounding(inputCompounding)

      history.push(usingExistingFlow ? paths.CREATE_KEYS_EXISTING : paths.CREATE_KEYS_CREATE);
    } else {
      setPasswordVerifyError(true);
    }
  };

  const onBackClick = () => {
    if (verifyPassword) {
      // Only reset password of configure form so the user can see index, number of keys, and address
      setPasswordToVerify("");
      setVerifyPassword(false);
      setPasswordVerifyError(false);
      setInputPassword("");
    } else {
      // Reset context
      setIndex(0);
      setNumberOfKeys(1);
      setAmount(32);
      setWithdrawalAddress("");
      setPassword("");
      setCompounding(false);

      // Reset form
      setInputNumberOfKeys(1);
      setInputIndex(0);
      setInputAmount(32);
      setInputWithdrawalAddress("");
      setInputPassword("");
      setInputCompounding(false);
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
            className="tw-mt-8 tw-w-[300px]"
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
                className="tw-flex-1"
                id="number-of-keys"
                label="Number of New Keys"
                variant="outlined"
                type="number"
                value={inputNumberOfKeys}
                onChange={updateNumberOfKeys}
                InputProps={{ inputProps: { min: 1, max: 1000 } }}
                error={inputNumberOfKeysError}
                helperText={ inputNumberOfKeysError ? errors.NUMBER_OF_KEYS : ""}
              />
            </Tooltip>

            {usingExistingFlow && (
              <Tooltip title={tooltips.STARTING_INDEX}>
                <TextField
                  className="tw-flex-1"
                  id="index"
                  label="Amount of Existing Keys (starting index)"
                  variant="outlined"
                  type="number"
                  value={inputIndex}
                  onChange={updateIndex}
                  InputProps={{ inputProps: { min: 1, max: 1000 } }}
                  error={inputIndexError}
                  helperText={inputIndexError ? errors.STARTING_INDEX : ""}
                />
            </Tooltip>
            )}

            <Tooltip title={tooltips.AMOUNT}>
              <TextField
                className="tw-flex-1"
                disabled={!inputCompounding}
                id="amount"
                label="Deposit Amount"
                type="number"
                variant="outlined"
                value={inputAmount}
                onChange={updateAmount}
                error={inputAmountError}
                helperText={inputAmountError ? errors.DEPOSIT_AMOUNT : ""}
              />
            </Tooltip>
          </div>

          <div className="tw-w-full tw-flex tw-flex-row tw-gap-4 tw-mt-8 ">
            <Tooltip title={tooltips.PASSWORD}>
              <TextField
                className="tw-flex-1"
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

            <Tooltip title={tooltips.ETH1_WITHDRAW_ADDRESS}>
              <TextField
                className="tw-w-[440px]"
                id="eth1-withdraw-address"
                label="Ethereum Withdrawal Address (Optional)"
                variant="outlined"
                value={inputWithdrawalAddress}
                onChange={updateEth1WithdrawAddress}
                error={inputWithdrawalAddressFormatError}
                helperText={ inputWithdrawalAddressFormatError ? errors.ADDRESS_FORMAT_ERROR : ""}
              />
            </Tooltip>
          </div>

          <div>
            <FormControlLabel
              label="Compounding Credentials (0x02) - Must have valid withdrawal credentials"
              control={
                <Checkbox
                  checked={inputCompounding}
                  disabled={!inputWithdrawalAddress}
                  onChange={updateCompounding}
                />
              }
            />
          </div>

          <Typography className="tw-text-center tw-mx-4" variant="body1">
            Please ensure that you have control over this address. If you do not add a withdrawal address now, you will be able to add one later with your 24 words secret recovery phrase.
          </Typography>
        </div>
      )}
    </WizardWrapper>
  );
};

export default ConfigureValidatorKeys;
