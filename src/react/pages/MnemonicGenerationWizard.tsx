import { Button } from '@material-ui/core';
import { FreeBreakfastOutlined } from '@material-ui/icons';
import React, { useState } from 'react';
import { useHistory, withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import { Gray4, Heading } from '../colors';
import GenerateMnemonic from '../components/MnemonicGenerationFlow/0-GenerateMnemonic';
import ShowMnemonic from '../components/MnemonicGenerationFlow/1-ShowMnemonic';
import VerifyMnemonic from '../components/MnemonicGenerationFlow/2-VerifyMnemonic';

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
}

type Props = RouteComponentProps<{}, any, IncomingState>;

const MnemonicGenerationWizard = (props: Props) => {
  const [step, setStep] = useState(0);
  const [mnemonic, setMnemonic] = useState("");
  const [verifyMnemonic, setVerifyMnemonic] = useState("");
  const [error, setError] = useState("");

  let history = useHistory();

  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Home";
      case 1:
        return "Prev"
      case 2:
        return "Prev"
    }
  }

  const prevClicked = () => {
    switch (step) {
      case 0: {
        toHome();
        break;
      }
      case 1: {
        setMnemonic("");
        setStep(step - 1);
        break;
      }
      case 2: {
        setVerifyMnemonic("");
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
        return "Verify";
    }
  }

  const nextClicked = () => {
    switch (step) {

      // GenerateMnemonic
      case 0: {
        uiCreateMnemonic();
        setStep(step + 1);
        break;
      }

      // ShowMnemonic
      case 1: {
        setStep(step + 1);
        break;
      }

      // VerifyMnemonic
      case 2: {
        if (mnemonic.localeCompare(verifyMnemonic) == 0) {
          setError("");
          toKeyGenerationWizard();
        } else {
          setError("Mnemonics don't match, please try again.");
        }
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

  const toKeyGenerationWizard = () => {
    const location = {
      pathname: '/keygeneration',
      state: {
        network: props.location.state.network,
        mnemonic: mnemonic,
        index: 0,
      }
    }

    history.push(location);
  }

  const uiCreateMnemonic = () => {
    // props.setMnemonic(createMnemonic('english'));
    setMnemonic("here is the test menmonic");
  }


  return (
    <WizardContainer>
      <Network>{props.location.state.network}</Network>
      <LandingHeader>Generate Mnemonic</LandingHeader>

      <GenerateMnemonic step={step} setMnemonic={setMnemonic} />
      <ShowMnemonic step={step} mnemonic={mnemonic} />
      <VerifyMnemonic step={step} setVerifyMnemonic={setVerifyMnemonic} error={error} />

      <FooterContainer>
        <Button variant="contained" onClick={prevClicked}>{prevLabel()}</Button>
        <Button variant="contained" onClick={nextClicked}>{nextLabel()}</Button>
      </FooterContainer>
    </WizardContainer>
  );
}

export default withRouter(MnemonicGenerationWizard);
