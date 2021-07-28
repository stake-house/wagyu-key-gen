import { Button, Grid, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useHistory, withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import { uname } from '../commands/BashUtils';
import { createMnemonic } from '../commands/Eth2Deposit';
import GenerateMnemonic from '../components/MnemonicGenerationFlow/0-GenerateMnemonic';
import ShowMnemonic from '../components/MnemonicGenerationFlow/1-2-ShowMnemonic';
import VerifyMnemonic from '../components/MnemonicGenerationFlow/3-VerifyMnemonic';

const MainGrid = styled(Grid)`
  width: 100%;
  margin: 0px;
  text-align: center;
`;

const ContentGrid = styled(Grid)`
  height: 450px;
`;

type Props = {
  network: string
}

type RouteProps = RouteComponentProps<{}, any, {}>;

const MnemonicGenerationWizard = (props: Props & RouteProps) => {
  const [step, setStep] = useState(0);
  const [mnemonic, setMnemonic] = useState("");
  const [verifyMnemonic, setVerifyMnemonic] = useState("");
  const [mnemonicValidationError, setMnemonicValidationError] = useState(false);

  let history = useHistory();

  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Back";
      case 1:
        return "Back";
      case 2:
        return "Back";
      case 3:
        return "Back";
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
        setStep(step - 1);
        break;
      }
      case 3: {
        setVerifyMnemonic("");
        setMnemonicValidationError(false)
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
        return "Generate";
      case 1:
        return "Next";
      case 2:
        return "I'm sure";
      case 3:
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

      // I'm Sure
      case 2: {
        setStep(step + 1);
        break;
      }

      // VerifyMnemonic
      case 3: {
        if (mnemonic.localeCompare(verifyMnemonic) == 0) {
          setMnemonicValidationError(false);
          toKeyGenerationWizard();
        } else {
          setMnemonicValidationError(true);
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
      pathname: '/wizard/keygeneration',
      state: {
        mnemonic: mnemonic,
        index: 0,
      }
    }

    history.push(location);
  }

  const uiCreateMnemonic = () => {
    if (uname() == "Linux") {
      setMnemonic(createMnemonic('english'));
    } else {
      setMnemonic("one two three four five six seven eight nine ten eleven twelve one two three four five six seven eight nine ten eleven twelve");
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
            Generate Mnemonic
          </Typography>
        </Grid>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={12}>
          <GenerateMnemonic step={step} setMnemonic={setMnemonic} />
          <ShowMnemonic step={step} mnemonic={mnemonic} />
          <VerifyMnemonic step={step} setVerifyMnemonic={setVerifyMnemonic} error={mnemonicValidationError} />
        </Grid>
      </ContentGrid>
      <Grid item container>
        <Grid item xs={2} text-align="center">
          <Button variant="contained" color="primary" onClick={prevClicked}>{prevLabel()}</Button>
        </Grid>
        <Grid item xs={8} />
        <Grid item xs={2} text-align="center">
          <Button variant="contained" color="primary" onClick={nextClicked}>{nextLabel()}</Button>
        </Grid>
      </Grid>
    </MainGrid>
  );
}

export default withRouter(MnemonicGenerationWizard);
