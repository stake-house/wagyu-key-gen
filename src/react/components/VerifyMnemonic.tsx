import { Grid, TextField } from "@mui/material";
import { Dispatch,  SetStateAction, useContext, useRef, useState } from "react";

import { errors } from "../constants";
import { GlobalContext } from "../GlobalContext";
import { KeyCreationContext } from "../KeyCreationContext";
import { Network } from "../types";

interface VerifyMnemonicParams {
  hasError: boolean;
  mnemonicToVerify: string;
  setMnemonicToVerify: Dispatch<SetStateAction<string>>;
  onVerifyMnemonic: () => void;
}

/**
 * Creates a grid of inputs if on mainnet or a single textbox for ease of testing.
 * The user fills the form with the mnemonic and the input will be provided to the
 * onVerifyMnemonic for further action
 *
 * mnemonicToVerify is provided as a param instead of existing only in this component
 * so the parent can fill the value if the user goes back in navigation
 */
const VerifyMnemonic = ({
  hasError = false,
  mnemonicToVerify,
  setMnemonicToVerify,
  onVerifyMnemonic,
}: VerifyMnemonicParams) => {
  const { mnemonic } = useContext(KeyCreationContext);
  const { network } = useContext(GlobalContext);
  const [mnemonicToVerifyArray, setMnemonicToVerifyArray] = useState<string[]>(
    mnemonicToVerify ? mnemonicToVerify.split(' ') : Array(24).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const updateMnemonicToVerifyWord = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    // Grab the new word value and strip all whitespace
    const newValue = e.currentTarget.value.replace(/\s+/g, '');

    // Grab the current array of words, and set the new word at the index
    const currentMnemonicToVerifyArray = mnemonicToVerifyArray;
    currentMnemonicToVerifyArray[index] = newValue;

    // Update state based on the new word, and update the mnemonicToVerify string up a level
    setMnemonicToVerifyArray(currentMnemonicToVerifyArray);
    setMnemonicToVerify(currentMnemonicToVerifyArray.join(' '));
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      onVerifyMnemonic();
    }
  };

  /**
   * Will focus on a new input depending on the pressed key
   * @param index the current input index
   */
  const handleKeysForWord = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    let nextFocus = index;
    const currentTextFieldValue = mnemonicToVerifyArray[index];

    if (e.key === ' ' && currentTextFieldValue.length >= 3 && index < 23) {
      nextFocus = index + 1;
    } else if (e.key === 'Backspace' && currentTextFieldValue.length === 0 && index >= 1) {
      nextFocus = index - 1;
    } else if (e.key === 'ArrowLeft') {
      nextFocus = (index + 23) % 24;
    } else if (e.key === 'ArrowUp') {
      nextFocus = (index + 18) % 24;
    } else if (e.key === 'ArrowRight') {
      nextFocus = (index + 1) % 24;
    } else if (e.key === 'ArrowDown') {
      nextFocus = (index + 6) % 24;
    } else if (e.key === 'Enter' && index === 23 && currentTextFieldValue) {
      onVerifyMnemonic();
    }

    if (nextFocus != index) {
      inputRefs.current[nextFocus].focus();
    }
  };

  const errorWithWordAtIndex = (index: number): boolean => {
    return hasError &&  mnemonic.split(' ')[index] != mnemonicToVerifyArray[index];
  };

  return (
    <Grid container item xs={10} spacing={2}>
      { network === Network.MAINNET ? (
        mnemonicToVerifyArray.map((value, index) => (
          <Grid item xs={2} key={"verify-mnemonic-grid-key-" + index}>
            <TextField
              autoFocus={index === 0}
              className="tw-mr-2"
              id={"verify-mnemonic-textfield-id-" + index}
              key={"verify-mnemonic-textfield-key-" + index}
              label={"Word " + (index+1)}
              variant="outlined"
              color="primary"
              value={value}
              onChange={updateMnemonicToVerifyWord(index)}
              onKeyDown={handleKeysForWord(index)}
              error={errorWithWordAtIndex(index)}
              inputRef={el => inputRefs.current[index] = el}
            />
          </Grid>
      ))) : (
        <Grid item xs={12}>
          <TextField
            id="verify-mnemonic"
            label="Confirm your Secret Recovery Phrase"
            multiline
            fullWidth
            rows={4}
            autoFocus
            variant="outlined"
            color="primary"
            error={hasError}
            helperText={ hasError ? errors.MNEMONICS_DONT_MATCH : ""}
            value={mnemonicToVerify}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMnemonicToVerify(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default VerifyMnemonic;
