import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { KEYSTORE_FILE_PREFIX, errors } from '../constants';
import StepNavigation from './StepNavigation';
import KeystoreValidation from './ExitTransactionGenerationFlow/1-KeystoreValidation';
import { Keystore } from '../types';
import KeystoreFolder from './ExitTransactionGenerationFlow/0-KeystoreFolder';

const ContentGrid = styled(Grid)`
  height: 350px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  epoch: number,
  setEpoch: Dispatch<SetStateAction<number>>,
  keystores: Keystore[],
  setKeystores: Dispatch<SetStateAction<Keystore[]>>,
  inputFolderPath: string,
  setInputFolderPath: Dispatch<SetStateAction<string>>,
  outputFolderPath: string,
  setOutputFolderPath: Dispatch<SetStateAction<string>>
}

/**
 * This is the wizard the user will navigate to configure their exit transaction change
 * @returns the react element to render
 */
const ExitTransactionConfigurationWizard: FC<Props> = (props): ReactElement => {
  const [folderError, setFolderError] = useState(false);
  const [folderErrorMsg, setFolderErrorMsg] = useState("");
  const [modalDisplay, setModalDisplay] = useState(false);
  const [step, setStep] = useState(0);

  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Back";
      case 1:
        return "Back";
    }
  }

  const prevClicked = () => {
    switch (step) {
      case 0: {
        props.onStepBack();
        break;
      }
      case 1: {
        props.setEpoch(0);
        props.setKeystores([]);
        props.setInputFolderPath("");
        setStep(0);
        break;
      }
      default: {
        break;
      }
    }
  }

  const nextLabel = () => {
    switch (step) {
      case 0:
        return "Next";
      case 1:
        return "Next";
    }
  }

  const nextClicked = () => {
    switch (step) {
      case 0: {
        if (disableNext()) {
          return;
        }

        setFolderError(false);
        setFolderErrorMsg("");

        // Verify the provided path exists, then get all keystore files, then covert each file
        // into a keystore object to provide the user with the public key to easily determine
        // the validator index through a beacon chain explorer
        window.bashUtils.doesDirectoryExist(props.inputFolderPath)
          .then((exists) => {
            if (!exists) {
              setFolderErrorMsg(errors.FOLDER_DOES_NOT_EXISTS);
              setFolderError(true);
            } else {

              window.bashUtils.findAllFiles(props.inputFolderPath, KEYSTORE_FILE_PREFIX)
                .then((matchedFileNames: string[]) => {
                  if (matchedFileNames.length === 0) {
                    setFolderErrorMsg(errors.KEYSTORE_NOT_FOUND);
                    setFolderError(true);
                  } else {
                    window.bashUtils.readKeystoreInformation(matchedFileNames)
                      .then((parsedKeystores: Keystore[]) => {
                        if (parsedKeystores.length === 0) {
                          setFolderErrorMsg(errors.KEYSTORE_PARSE_ERROR);
                          setFolderError(true);
                        } else {
                          props.setKeystores(parsedKeystores);
                          setStep(step + 1);
                        }
                      })
                  }
                });
            }
          });

        break;
      }
      case 1: {
        if (disableNext()) {
          return;
        }

        props.onStepForward();
      }
    }
  }

  const disableNext = () => {
    switch(step) {
      case 0:
        return modalDisplay || props.inputFolderPath === "";
      case 1:
        return props.keystores.reduce((invalid: boolean, keystore) => {
          if (keystore.password === "" || keystore.validatorIndex === "") {
            return true;
          }

          return invalid;
        }, false);
      default:
        return false;
    }
  }

  const content = () => {
    switch(step) {
      case 0:
        return (
          <KeystoreFolder
            folderError={folderError}
            setFolderError={setFolderError}
            folderErrorMsg={folderErrorMsg}
            setFolderErrorMsg={setFolderErrorMsg}
            folderPath={props.inputFolderPath}
            setFolderPath={props.setInputFolderPath}
            modalDisplay={modalDisplay}
            setModalDisplay={setModalDisplay}
          />
        );
      case 1:
        return (
          <KeystoreValidation
            epoch={props.epoch}
            setEpoch={props.setEpoch}
            keystores={props.keystores}
            setKeystores={props.setKeystores}
          />
        );
      default:
        return null;
    }
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
          Generate signed exit transaction
        </Typography>
      </Grid>
      <ContentGrid item container>
        <Grid item xs={12}>
          {content()}
        </Grid>
      </ContentGrid>
      {props.children}
      <StepNavigation
        onPrev={prevClicked}
        onNext={nextClicked}
        backLabel={prevLabel()}
        nextLabel={nextLabel()}
        disableBack={false}
        disableNext={disableNext()}
      />
    </Grid>
  );
}

export default ExitTransactionConfigurationWizard;
