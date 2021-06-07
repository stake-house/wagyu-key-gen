import { Button, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { RouteComponentProps, useHistory, withRouter } from "react-router-dom";
import styled from "styled-components";
import { Gray4, Heading } from "../colors";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const Network = styled.div`
  color: ${Gray4};
  margin-top: 35px;
  margin-right: 35px;
  align-self: flex-end;
`;

const LandingHeader = styled.div`
  font-weight: 700;
  font-size: 35px;
  margin-top: 30px;
  color: ${Heading};
  max-width: 550;
`;

const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  align-self: flex-end;
  height: 70;
  flex-grow:1;
  min-width:100vw;
`;

type IncomingState = {
  network: string,
}

type Props = RouteComponentProps<{}, any, IncomingState>;

const MnemonicImport = (props: Props) => {
  const [mnemonic, setMnemonic] = useState("");

  let history = useHistory();

  const updateInputMnemonic = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMnemonic(e.target.value);
  }

  const toHome = () => {
    history.push("/");
  }

  const toKeyGenerationWizard = () => {
    // TODO: validate mnemonic

    const location = {
      pathname: '/keygeneration',
      state: {
        network: props.location.state.network,
        mnemonic: mnemonic,
        index: null,
      }
    }

    history.push(location);
  }

  return (
    <Container>
      <Network>{props.location.state.network}</Network>
      <LandingHeader>Import Mnemonic</LandingHeader>

      VerifyMnemonic
      <TextField id="mnemonic" label="Mnemonic" variant="outlined" onChange={updateInputMnemonic} />

      <FooterContainer>
        <Button variant="contained" onClick={toHome}>Back</Button>
        <Button variant="contained" onClick={toKeyGenerationWizard}>Import</Button>
      </FooterContainer>
    </Container>
  )
}

export default withRouter(MnemonicImport);