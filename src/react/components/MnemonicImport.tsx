import { Grid, TextField, Typography } from "@material-ui/core";
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { errors, MNEMONIC_LENGTH } from "../constants";
import StepNavigation from './StepNavigation';

const ContentGrid = styled(Grid)`
  height: 350px;
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
    <Grid container spacing={5} direction="column">
      <Grid item container>
        <Grid item xs={12}>
          <Typography variant="h1">
            Import Mnemonic
          </Typography>
        </Grid>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={1} />
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
            onChange={updateInputMnemonic} />
        </Grid>
      </ContentGrid>
      {props.children}
      <StepNavigation
        onStepBack={props.onStepBack}
        onStepForward={onImport}
        forwardLabel="Import"
        disableForward={disableImport}
      />
    </Grid>
  )
}

export default MnemonicImport;