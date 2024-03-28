import { FileCopy } from "@mui/icons-material";
import { Button, Grid, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { useContext, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

import Loader from "../components/Loader";
import VerifyMnemonic from "../components/VerifyMnemonic";
import WizardWrapper from "../components/WizardWrapper";
import { paths } from "../constants";
import { cleanMnemonic } from '../helpers';
import { KeyCreationContext } from "../KeyCreationContext";
import { StepKey } from "../types";

/**
 * Creates a new mnemonic for the user which will then be validated to make sure the
 * user has stored it properly.
 */
const CreateMnemonic = () => {
  const {mnemonic, setMnemonic} = useContext(KeyCreationContext);
  const history = useHistory();

  const [confirmMnemonic, setConfirmMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const [generateErrorMessage, setGenerateErrorMessage] = useState<string>("");
  const [mnemonicValidationError, setMnemonicValidationError] = useState(false);
  const [mnemonicToVerify, setMnemonicToVerify] = useState<string>("");
  const [showLoader, setShowLoader] = useState(false);
  const [verifyNext, setVerifyNext] = useState(false);

  // Text to show for the Next button based on the state
  const nextText = useMemo(() => confirmMnemonic ? "Check" : verifyNext ? "I'm Sure" : mnemonic ? "Next" : "Create", [confirmMnemonic, mnemonic, verifyNext]);

  useEffect(() => {
    // page loaded with mnemonic known. Can only happen when the user backs up from configure
    if (mnemonic) {
      setConfirmMnemonic(true);
      setMnemonicToVerify(mnemonic);
      setMnemonicValidationError(false);
    }
  }, [])

  const generateMnemonic = () => {
    setGenerateErrorMessage("");

    window.eth2Deposit.createMnemonic('english').then((mnemonic) => {
      setMnemonic(mnemonic);
      setShowLoader(false);
    }).catch((error) => {
      setShowLoader(false);
      setMnemonic("");
      const errorMsg = ('stderr' in error) ? error.stderr : error.message;
      setGenerateErrorMessage(errorMsg);
    });
  };

  const onBackClick = () => {
    if (confirmMnemonic) {
      setConfirmMnemonic(false);
      setMnemonicToVerify("");
      setMnemonicValidationError(false);
    } else if (verifyNext) {
      setVerifyNext(false);
    } else if (mnemonic) {
      setMnemonic("");
    } else {
      history.replace("/")
    }
  };

  const onNextClick = () => {
    if (confirmMnemonic) {
      verifyMnemonic();
    } else if (verifyNext) {
      setConfirmMnemonic(true);
      setMnemonicToVerify("");
    } else if (mnemonic) {
      setVerifyNext(true);
    } else {
      setShowLoader(true);
      generateMnemonic();
    }
  };

  /**
   * Creates an array of inputs that will display each word of the mnemonic
   */
  const createMnemonicDisplay = () => {
    return(
      <Grid container item xs={10} spacing={2}>
        {
          mnemonic.split(' ').map((word, i) => {
            return (
              <Grid item xs={2} key={"mnemonic-grid-key-" + i}>
                <TextField
                  disabled
                  id={"mnemonic-textfield-id-" + i}
                  key={"mnemonic-textfield-key-" + i}
                  label={"Word " + (i+1)}
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#FFFFFF",
                    },
                  }}
                  variant="outlined"
                  value={word} />
              </Grid>
            );
          })
        }
      </Grid>
    );
  };

  const handleCopyTooltipClose = () => {
    setCopyTooltipOpen(false);
    setTimeout(() => setCopied(false), 200);
  };

  const handleCopyTooltipOpen = () => {
    setCopyTooltipOpen(true);
  };

  const copyMnemonic = () => {
    window.electronAPI.clipboardWriteText(mnemonic);
    setCopied(true);
  };

  const verifyMnemonic = () => {
    const cleanedMnemonic = cleanMnemonic(mnemonic);
    const cleanedMnemonicToVerify = cleanMnemonic(mnemonicToVerify);
    setMnemonicToVerify(mnemonicToVerify);

    if (cleanedMnemonic.localeCompare(cleanedMnemonicToVerify) === 0) {
      setMnemonicValidationError(false);
      history.push(paths.CONFIGURE_CREATE);
    } else {
      setMnemonicValidationError(true);
    }
  };

  return (
    <WizardWrapper
      actionBarItems={[
        <Button variant="contained" color="primary" disabled={showLoader} onClick={() => onBackClick()} tabIndex={3}>Back</Button>,
        <Button variant="contained" color="primary" disabled={showLoader} onClick={() => onNextClick()} tabIndex={2}>{nextText}</Button>,
      ]}
      activeTimelineIndex={0}
      timelineItems={[StepKey.MnemonicGeneration, StepKey.KeyConfiguration, StepKey.KeyGeneration, StepKey.Finish]}
      title="Create Secret Recovery Phrase"
    >
      { confirmMnemonic ? (
        <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center">
          <div>Please retype your Secret Recovery Phrase here to make sure you have it saved correctly.</div>
          <VerifyMnemonic
            hasError={mnemonicValidationError}
            mnemonicToVerify={mnemonicToVerify}
            setMnemonicToVerify={setMnemonicToVerify}
            onVerifyMnemonic={() => verifyMnemonic()}
          />
        </div>
      ) : mnemonic ? (
        <div className="tw-flex tw-flex-col tw-gap-4">
          <div className="tw-text-center">
            {verifyNext ?
              <div className="tw-text-cyan">Make sure you back it up - without it you will not be able to retrieve your funds. You will be prompted for it next.</div> :
              <div>Below is your Secret Recovery Phrase. Make sure you back it up - without it you will not be able to retrieve your funds.</div>
            }
          </div>

          <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center tw-justify-center">
            {createMnemonicDisplay()}
            <div className="tw-absolute tw-right-6">
              <Tooltip title={copied ? "Copied" : "Copy"} open={copyTooltipOpen} onClose={handleCopyTooltipClose} onOpen={handleCopyTooltipOpen}>
                <IconButton
                  aria-label="copy"
                  autoFocus
                  color="primary"
                  onClick={copyMnemonic}
                >
                  <FileCopy />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      ) : showLoader ? (
        <Loader message="Generating your secret recovery phrase. May take up to 30 seconds." />
      ) : (
        <div className="tw-flex tw-flex-col tw-gap-4 tw-px-24 tw-mt-4">
          <Typography className="tw-text-left" variant="body1">
            In this step, we'll generate a Secret Recovery Phrase (traditionally referred to as a "mnemonic") and a set of validator keys for you. For more information, visit: https://kb.beaconcha.in/ethereum-2-keys
          </Typography>
          <Typography className="tw-text-left" variant="body1">
            It is{" "}
            <span className="tw-font-bold">very</span>{" "}
            important to{" "}
            <span className="tw-text-cyan">keep both your secret recovery phrase and your validator keys safe and secure</span>{" "}
            as you will need them to retrieve your funds later. Anybody with access to these will also be able to steal your funds! For tips on storage, see: https://www.ledger.com/blog/how-to-protect-your-seed-phrase
          </Typography>
          <Typography className="tw-text-left" variant="body1">
            We recommend running Wagyu Key Gen from an offline machine. One way to do this is to move the application to a USB stick, plug it in to an offline machine, and run it from there.
          </Typography>
          { generateErrorMessage && (
            <Typography
              className="tw-text-left"
              color="error"
              gutterBottom
              variant="body1"
            >
              {generateErrorMessage}
            </Typography>
          )}
        </div>
      )}
    </WizardWrapper>
  );
};

export default CreateMnemonic;

