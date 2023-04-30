import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction, useState } from 'react';
import styled from 'styled-components';
import StepNavigation from './StepNavigation';
import { errors } from '../constants';
import SelectOutputFolder from './ExitTransactionGenerationFlow/2-SelectOutputFolder';
import CreatingExitTransactions from './ExitTransactionGenerationFlow/3-CreatingExitTransactions';
import { Network } from '../types';

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  mnemonic: string,
  index: number,
  epoch: number,
  validatorIndices: string,
  network: Network,
  folderPath: string,
  setFolderPath: Dispatch<SetStateAction<string>>,
}

const ExitTransactionMnemonicGenerationWizard: FC<Props> = (props): ReactElement => {
  const [step, setStep] = useState(0);
  const [folderError, setFolderError] = useState(false);
  const [folderErrorMsg, setFolderErrorMsg] = useState("");
  const [modalDisplay, setModalDisplay] = useState(false);

  const prevLabel = () => {
    switch (step) {
      case 0:
        return "Back";
      case 1:
        return ""; // no back button
    }
  }

  const prevClicked = () => {
    switch (step) {
      case 0: {
        props.setFolderPath("");
        setFolderError(false);
        setFolderErrorMsg("");
        props.onStepBack();
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
        return "Create";
      case 1:
        return ""; // no next button
    }
  }

  const nextClicked = () => {
    switch (step) {
      // Select Folder
      case 0: {
        if (props.folderPath != "") {
          setFolderError(false);
          setFolderErrorMsg("");

          window.bashUtils.doesDirectoryExist(props.folderPath)
            .then((exists) => {
              if (!exists) {
                setFolderErrorMsg(errors.FOLDER_DOES_NOT_EXISTS);
                setFolderError(true);
              } else {

                window.bashUtils.isDirectoryWritable(props.folderPath)
                  .then((writable) => {
                    if (!writable) {
                      setFolderErrorMsg(errors.FOLDER_IS_NOT_WRITABLE);
                      setFolderError(true);
                    } else {
                      setStep(step + 1);
                      generateExitTransactions();
                    }
                  });
              }
            });

        } else {
          setFolderError(true);
          setFolderErrorMsg(errors.FOLDER);
        }

        break;
      }

      case 1: {
        // there is no next button here
        // step is autoincremented once file is created
        break;
      }

      default: {
        break;
      }

    }
  }

  const generateExitTransactions = () => {
    window.eth2Deposit.generateExitTransactionsMnemonic(
        props.folderPath,
        props.network,
        props.mnemonic,
        props.index,
        props.epoch,
        props.validatorIndices
    ).then(() => {
      props.onStepForward();
    }).catch((error) => {
      setStep(0);
      setFolderError(true);
      const errorMsg = ('stderr' in error) ? error.stderr : error.message;
      setFolderErrorMsg(errorMsg);
    })
  }

  const content = () => {
    switch(step) {
      case 0:
        return (
          <SelectOutputFolder
            setFolderPath={props.setFolderPath}
            folderPath={props.folderPath}
            setFolderError={setFolderError}
            folderError={folderError}
            setFolderErrorMsg={setFolderErrorMsg}
            folderErrorMsg={folderErrorMsg}
            modalDisplay={modalDisplay}
            setModalDisplay={setModalDisplay}
          />
        );
      case 1:
        return (
          <CreatingExitTransactions />
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
        disableBack={modalDisplay}
        disableNext={!props.folderPath || modalDisplay}
        hideBack={step === 1}
        hideNext={step === 1}
      />
    </Grid>
  );
}

export default ExitTransactionMnemonicGenerationWizard;