import { Button, Grid, Typography } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import React, { useState } from 'react';
import { useHistory, withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import { uname } from '../commands/BashUtils';
import { generateKeys } from '../commands/Eth2Deposit';
import { executeCommandSync } from '../commands/ExecuteCommand';
import KeyInputs from '../components/KeyGeneratioinFlow/0-KeyInputs';
import VerifyKeysPassword from '../components/KeyGeneratioinFlow/1-VerifyKeysPassword';
import SelectFolder from '../components/KeyGeneratioinFlow/2-SelectFolder';
import CreatingKeys from '../components/KeyGeneratioinFlow/3-CreatingKeys';
import KeysCreated from '../components/KeyGeneratioinFlow/4-KeysCreated';

const MainGrid = styled(Grid)`
  width: 100%;
  margin: 0px;
  text-align: center;
`;

const ContentGrid = styled(Grid)`
  height: 450px;
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
  const [numberOfKeysError, setNumberOfKeysError] = useState(false);
  const [passwordStrengthError, setPasswordStrengthError] = useState(false);
  const [passwordVerifyError, setPasswordVerifyError] = useState(false);
  const [startingIndexError, setStartingIndexError] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [folderError, setFolderError] = useState(false);


  const history = useHistory();
  
  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Back";
      case 1:
        return "Back";
      case 2:
        return "Back";
      case 3:
        return ""; // no back button
      case 4:
        return ""; // no back button
    }
  }

  const prevClicked = () => {
    switch (step) {
      case 0: {
        setNumberOfKeysError(false);
        setPasswordStrengthError(false);
        setStartingIndexError(false);
        // TODO: make this go back, not home
        toHome();
        break;
      }
      case 1: {
        setPasswordVerifyError(false);
        setNumberOfKeys(0);
        setPassword("");
        setIndex(props.location.state.index);
        setVerifyPassword("");
        setStep(step - 1);
        break;
      }
      case 2: {
        setStep(step - 1);
        setFolderPath("");
        setFolderError(false);
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
        return "Next";
      case 1:
        return "Verify";
      case 2:
        return "Create";
      case 3:
        return ""; // no next button
      case 4:
        return "Finished";
    }
  }

  const nextClicked = () => {
    switch (step) {

      // Inputs
      case 0: {
        let isError = false;

        if (numberOfKeys < 1) {
          setNumberOfKeysError(true);
          isError = true;
        } else {
          setNumberOfKeysError(false);
        }
        
        if (password.length < 8) {
          setPasswordStrengthError(true);
          isError = true;
        } else {
          setPasswordStrengthError(false);
        }
        
        if (index == null || index < 0) {
          setStartingIndexError(true);
          isError = true;
        } else {
          setStartingIndexError(false);
        }

        if (!isError) {
          setNumberOfKeysError(false);
          setPasswordStrengthError(false);
          setStartingIndexError(false);
          setStep(step + 1);
        }

        break;
      }

      // Verify Password
      case 1: {
        if (password.localeCompare(verifyPassword) == 0) {
          setPasswordVerifyError(false);
          setStep(step + 1);
        } else {
          setPasswordVerifyError(true);
        }

        break;
      }

      // Select Folder
      case 2: {
        if (folderPath != "") {
          setFolderError(false);
          setStep(step + 1);

          setTimeout(() => {
            handleKeyGeneration();
            // Move on to the last page when done
            setStep(4);
          }, 1000);

        } else {
          setFolderError(true);
        }

        break;
      }

      // Keys are being generated
      case 3: {
        // there is no next button here
        // step is autoincremented once keys are created
        break;
      }

      // Keys Generated
      case 4: {
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

  const handleKeyGeneration = () => {
    const os = uname();

    if (os == "Linux") {
      console.log("On linux, generating keys.");
      generateKeys(props.location.state.mnemonic, index!, numberOfKeys, props.location.state.network.toLowerCase(), password, "", folderPath);
    } else {
      console.log("Pretended to generate keys since not on linux.");
      executeCommandSync("/Users/colfaxselby/Documents/projects/stakehouse/wagyu-key-gen/sleep.sh")
    }
  }

  return (
    <MainGrid container spacing={5} direction="column">
      <Grid item container>
        <Grid item xs={10}/>
        <Grid item xs={2}>
          <Typography variant="caption" style={{color: "gray"}}>
            Network: {props.location.state.network}
          </Typography>
        </Grid>
      </Grid>
      <Grid item container>
        <Grid item xs={12}>
          <Typography variant="h1">
            Generate Keys
          </Typography>
        </Grid>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={12}>
          <KeyInputs step={step} setNumberOfKeys={setNumberOfKeys} index={index} setIndex={setIndex} setPassword={setPassword} numberOfKeysError={numberOfKeysError}
            passwordStrengthError={passwordStrengthError} startingIndexError={startingIndexError} />
          <VerifyKeysPassword step={step} setVerifyPassword={setVerifyPassword} passwordVerifyError={passwordVerifyError} />
          <SelectFolder step={step} setFolderPath={setFolderPath} folderPath={folderPath} setFolderError={setFolderError} folderError={folderError} />
          <CreatingKeys step={step} />
          <KeysCreated step={step} folderPath={folderPath} />
        </Grid>
      </ContentGrid>
      { step < 3 && <Grid item container>
        <Grid item xs={2} text-align="center">
          <Button variant="contained" color="primary" onClick={prevClicked}>{prevLabel()}</Button>
        </Grid>
        <Grid item xs={8} />
        <Grid item xs={2} text-align="center">
          <Button variant="contained" color="primary" onClick={nextClicked}>{nextLabel()}</Button>
        </Grid>
      </Grid> }
      { step == 4 && <Grid item container>
        <Grid item xs={12} text-align="center">
          <Button variant="contained" color="primary" onClick={nextClicked}>{nextLabel()}</Button>
        </Grid>
      </Grid> }
    </MainGrid>
  );
}

export default withRouter(KeyGenerationWizard);