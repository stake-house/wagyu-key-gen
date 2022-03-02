import { Grid, TextField } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction, useState } from 'react';
import { errors } from '../../constants';
import { Network } from '../../types';

type VerifyMnemonicProps = {
  mnemonicToVerify: string,
  setMnemonicToVerify: Dispatch<SetStateAction<string>>,
  error: boolean,
  onVerifyMnemonic: () => void,
  network: Network,
  mnemonic: string
}

/**
 * This page prompts the user to input the mnemonic and then checks it against what the actual mnemonic is
 * to make sure the user copied it down correctly.
 * 
 * @param props self documenting parameters passed in
 * @returns react element to render
 */
const VerifyMnemonic: FC<VerifyMnemonicProps> = (props): ReactElement => {
  let inputFields:Array<React.MutableRefObject<HTMLInputElement | undefined>> = [];

  const [mnemonicToVerifyArray, setMnemonicToVerifyArray] = useState(
    props.mnemonicToVerify ? props.mnemonicToVerify.split(' ') : Array(24).fill(''));

  const updateMnemonicToVerify = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setMnemonicToVerify(e.currentTarget.value);
  }

  const updateMnemonicToVerifyWord = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    // Grab the new word value and strip all whitespace
    const newValue = e.currentTarget.value.replace(/\s+/g, '');

    // Grab the current array of words, and set the new word at the index
    const currentMnemonicToVerifyArray = mnemonicToVerifyArray;
    currentMnemonicToVerifyArray[index] = newValue;

    // Update state based on the new word, and update the mnemonicToVerify string up a level
    setMnemonicToVerifyArray(currentMnemonicToVerifyArray);
    props.setMnemonicToVerify(currentMnemonicToVerifyArray.join(' '));
  }
  
  const handleKeysForWord = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Navigate phrase confirmation with spacebar or arrowkeys
    let nextFocus = index;
    const currentTextFieldValue = mnemonicToVerifyArray[index];
    
    if (e.key === ' ' && currentTextFieldValue.length >= 4 && index < 23) {
      nextFocus = index + 1;
    } else if (e.key === 'Backspace' && currentTextFieldValue.length == 0 && index >= 1) {
      nextFocus = (index - 1) % 24; 
    } else if (e.key === 'ArrowLeft') {
      nextFocus = (index - 1) % 24;
    } else if (e.key === 'ArrowUp') {
      nextFocus = (index - 6) % 24;
    } else if (e.key === 'ArrowRight') {
      nextFocus = (index + 1) % 24;
    } else if (e.key === 'ArrowDown') {
      nextFocus = (index + 6) % 24;
    }

    if (nextFocus != index) {
      inputFields.at(nextFocus)?.current?.focus();
    }
    
  }
  
  const errorWithWordAtIndex = (index: number): boolean => {
    return props.error &&  props.mnemonic.split(' ')[index] != mnemonicToVerifyArray[index];
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      props.onVerifyMnemonic();
    }
  }

  const createInputs = () => {
    let inputs = [];
 
    for (let i = 0; i < 24; i++) {
      const inputRef = React.useRef<HTMLInputElement>();

      inputs.push(
        <Grid item xs={2} key={"verify-mnemonic-grid-key-" + i}>
          <TextField
            id={"verify-mnemonic-textfield-id-" + i}
            key={"verify-mnemonic-textfield-key-" + i}
            label={"Word " + (i+1)}
            variant="outlined"
            color="primary"
            error={errorWithWordAtIndex(i)}
            value={mnemonicToVerifyArray[i]}
            onChange={updateMnemonicToVerifyWord(i)}
            onKeyDown={handleKeysForWord(i)} 
            inputRef={inputRef} />
        </Grid>
      );

      inputFields.push(inputRef);
    }

    return(
      <Grid container item xs={10} spacing={2}>
        { inputs }
      </Grid>
    );
  }

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item xs={12}>
        Please retype your Secret Recovery Phrase here to make sure you have it saved correctly.
      </Grid>
      <Grid item container xs={12}>
        <Grid item xs={1} />
        { props.network != Network.MAINNET && (
          <Grid item xs={10}>
            <TextField
              id="verify-mnemonic"
              label="Confirm your Secret Recovery Phrase"
              multiline
              fullWidth
              rows={4}
              autoFocus
              variant="outlined"
              color="primary"
              error={props.error}
              helperText={ props.error ? errors.MNEMONICS_DONT_MATCH : ""}
              value={props.mnemonicToVerify}
              onChange={updateMnemonicToVerify}
              onKeyDown={handleKeyDown} />
          </Grid>
        )}
        { props.network == Network.MAINNET && (
          createInputs()
        )}
        <Grid item xs={1} />
      </Grid>
    </Grid>
  );
}

export default VerifyMnemonic;
