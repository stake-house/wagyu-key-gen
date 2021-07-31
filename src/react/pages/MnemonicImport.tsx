import { Button, Grid, TextField, Typography } from "@material-ui/core";
import React, { useState, Dispatch, SetStateAction } from "react";
import { RouteComponentProps, useHistory, withRouter } from "react-router-dom";
import styled from "styled-components";
import { errors, MNEMONIC_LENGTH } from "../constants";

const MainGrid = styled(Grid)`
  width: 100%;
  margin: 0px;
  text-align: center;
`;

const ContentGrid = styled(Grid)`
  height: 450px;
`;

type Props = {
  network: string,
  mnemonic: string,
  setMnemonic: Dispatch<SetStateAction<string>>
}

type RouteProps = RouteComponentProps<{}, any, {}>;

const MnemonicImport = (props: Props & RouteProps) => {
  const [mnemonicError, setMnemonicError] = useState(false);

  let history = useHistory();

  const updateInputMnemonic = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setMnemonic(e.target.value);
  }

  const toHome = () => {
    history.push("/");
  }

  const toKeyGenerationWizard = () => {
    const mnemonicArray = props.mnemonic.split(" ");

    if (mnemonicArray.length != MNEMONIC_LENGTH) {
      setMnemonicError(true);
    } else {
      setMnemonicError(false);

      const location = {
        pathname: '/wizard/keygeneration',
        state: {
          network: props.network,
          index: null,
        }
      }

      history.push(location);
    }
  }

  return (
    <MainGrid container spacing={5} direction="column">
      <Grid item container>
        <Grid item xs={10}/>
        <Grid item xs={2}>
          <Typography variant="caption" style={{color: "gray"}}>
            Network: {props.network}
          </Typography>
        </Grid>
      </Grid>
      <Grid item container>
        <Grid item xs={12}>
          <Typography variant="h1">
            Import Secret Recovery Phrase
          </Typography>
        </Grid>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={1} />
        <Grid item xs={10}>
          <TextField
            id="mnemonic-input"
            label="Type your Secret Recovery Phrase here"
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
      <Grid item container>
        <Grid item xs={2} text-align="center">
          <Button variant="contained" color="primary" onClick={toHome}>Back</Button>
        </Grid>
        <Grid item xs={8} />
        <Grid item xs={2} text-align="center">
          <Button variant="contained" color="primary" onClick={toKeyGenerationWizard}>Import</Button>
        </Grid>
      </Grid>
    </MainGrid>
  )
}

export default withRouter(MnemonicImport);
