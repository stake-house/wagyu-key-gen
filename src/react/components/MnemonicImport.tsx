import { Grid, TextField, Typography } from "@material-ui/core";
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { errors, MNEMONIC_LENGTH } from "../constants";
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  mnemonic: string,
  setMnemonic: Dispatch<SetStateAction<string>>,
  onStepBack: () => void,
  onStepForward: () => void
}

const MnemonicImport: FC<Props> = (props): ReactElement => {
  const [mnemonicError, setMnemonicError] = useState(false);

  const updateInputMnemonic = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setMnemonic(e.target.value);
  }

  const disableImport = !props.mnemonic;

  const onImport = () => {
    const mnemonicArray = props.mnemonic.split(" ");

    if (mnemonicArray.length != MNEMONIC_LENGTH) {
      setMnemonicError(true);
    } else {
      setMnemonicError(false);
      props.onStepForward();
    }
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
          Import Mnemonic
        </Typography>
      </Grid>
      <ContentGrid item container justifyContent="center">
        <Grid item xs={10}>
          <TextField
            id="mnemonic-input"
            label="Type your mnemonic here"
            multiline
            fullWidth
            rows={4}
            variant="outlined"
            color="primary"
            error={mnemonicError}
            helperText={ mnemonicError ? errors.MNEMONIC_FORMAT : ""}
            value={props.mnemonic}
            onChange={updateInputMnemonic} />
        </Grid>
      </ContentGrid>
      {/* props.children is the stepper */}
      {props.children}
      <StepNavigation
        onPrev={props.onStepBack}
        onNext={onImport}
        backLabel="Back"
        nextLabel="Import"
        disableNext={disableImport}
      />
    </Grid>
  )
}

export default MnemonicImport;