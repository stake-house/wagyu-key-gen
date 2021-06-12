import { Button } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import React, { useState } from 'react';
import { useHistory, withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import { Gray4, Heading } from '../colors';
import { uname } from '../commands/BashUtils';
import { generateKeys } from '../commands/Eth2Deposit';
import KeyInputs from '../components/KeyGeneratioinFlow/0-KeyInputs';
import VerifyKeysPassword from '../components/KeyGeneratioinFlow/1-VerifyKeysPassword';
import KeysCreated from '../components/KeyGeneratioinFlow/2-KeysCreated';

const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const LandingHeader = styled.div`
  font-weight: 700;
  font-size: 35px;
  margin-top: 30px;
  color: ${Heading};
  max-width: 550;
`;

const Network = styled.div`
  color: ${Gray4};
  margin-top: 35px;
  margin-right: 35px;
  align-self: flex-end;
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
  mnemonic: string,
  index: number | null,
}

type Props = RouteComponentProps<{}, any, IncomingState>;

const KeyGenerationWizard = (props: Props) => {
  const [step, setStep] = useState(0);
  const [index, setIndex] = useState(props.location.state.index);
  const [numberOfKeys, setNumberOfKeys] = useState(0);
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [error, setError] = useState("");


  let history = useHistory(); 
  
  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Restart";
      case 1:
        return "Prev"
      case 2:
        return "Prev"
    }
  }

  const prevClicked = () => {
    switch (step) {
      case 0: {
        setError("");
        toHome();
        break;
      }
      case 1: {
        setError("");
        setStep(step - 1);
        break;
      }
      case 2: {
        setStep(step - 1);
        break;
      }
      default: {
        console.log("This should never happen.")
        break;
      }
    }
  }

  const nextLabel = () => {
    switch (step) {
      case 0:
        return "Next"
      case 1:
        return "Next"
      case 2:
        return "Close";
    }
  }

  const nextClicked = () => {
    switch (step) {

      // Inputs
      case 0: {
        // TODO: verify password strength - use deposit cli api?
        if (numberOfKeys == 0) {
          setError("Please input number of keys.");
        } else if (index == null) {
          setError("Please input starting index.");
        } else if (password.length < 8) {
          setError("Password must be at least 8 characters.");
        } else {
          setError("");
          setStep(step + 1);
        }
        break;
      }

      // Verify Password
      case 1: {
        if (password.localeCompare(verifyPassword) == 0) {
          setError("");

          if (uname() == "Linux") {
            generateKeys(props.location.state.mnemonic, index!, numberOfKeys, props.location.state.network.toLowerCase(), password, "");
          } else {
            console.log("Pretended to generate keys since not on linux.");
          }

          setStep(step + 1);
        } else {
          setError("Passwords don't match, please try again.");
        }
        break;
      }

      // Keys Generated
      case 2: {
        close();
        break;
      }

      default: {
        console.log("This should never happen.")
        break;
      }

    }
  }

  const toHome = () => {
    history.push("/");
  }

  const close = () => {
    ipcRenderer.send("close");
  }

  return (
    <WizardContainer>
      <Network>{props.location.state.network}</Network>
      <LandingHeader>Generate Keys</LandingHeader>

      <KeyInputs step={step} setNumberOfKeys={setNumberOfKeys} index={index} setIndex={setIndex} setPassword={setPassword} error={error} />
      <VerifyKeysPassword step={step} setVerifyPassword={setVerifyPassword} error={error} />
      <KeysCreated step={step} />

      <FooterContainer>
        <Button variant="contained" onClick={prevClicked}>{prevLabel()}</Button>
        <Button variant="contained" onClick={nextClicked}>{nextLabel()}</Button>
      </FooterContainer>
    </WizardContainer>
  );
}

export default withRouter(KeyGenerationWizard);