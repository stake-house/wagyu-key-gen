import { Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement, Dispatch, SetStateAction, useState } from 'react';
import styled from 'styled-components';
import SelectFolder from './BTECGenerationFlow/2-SelectFolder';
import CreatingBTECFile from './BTECGenerationFlow/3-CreatingBTECFile';
import BTECFileCreated from './BTECGenerationFlow/4-BTECFileCreated';
import StepNavigation from './StepNavigation';
import { Network } from '../types';
import { errors } from '../constants';

const ContentGrid = styled(Grid)`
  height: 320px;
  margin-top: 16px;
`;

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  network: Network,
  mnemonic: string,
  startIndex: number,
  withdrawalAddress: string,
  btecIndices: string,
  btecCredentials: string,
  folderPath: string,
  setFolderPath: Dispatch<SetStateAction<string>>,
}

/**
 * This is the wizard the user will navigate to generate their BTEC.
 * It uses the notion of a 'step' to render specific pages within the flow.
 * 
 * @param props.onStepBack function to execute when stepping back
 * @param props.onStepForward function to execute when stepping forward
 * @param props.network network the app is running for
 * @param props.mnemonic the mnemonic
 * @param props.startIndex the index at which to start generating BTEC for the user
 * @param props.withdrawalAddress the wallet address for the withdrawal credentials
 * @param props.btecIndices a list of the chosen validator index number(s) as identified on the beacon chain
 * @param props.btecCredentials a list of the old BLS withdrawal credentials of the given validator(s)
 * @param props.folderPath the path at which to store the keys
 * @param props.setFolderPath function to update the path
 * @returns the react element to render
 */
const BTECGenerationWizard: FC<Props> = (props): ReactElement => {
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
        console.log("BTEC generation step is greater than 0 and prev was clicked. This should never happen.")
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
                      handleBTECFileGeneration();
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

      // BTEC file is being generated
      case 1: {
        // there is no next button here
        // step is autoincremented once file is created
        break;
      }

      default: {
        console.log("BTEC generation step is greater than 1 and next was clicked. This should never happen.")
        break;
      }

    }
  }

  const handleBTECFileGeneration = () => {

    let withdrawalAddress = props.withdrawalAddress;

    if (withdrawalAddress != "" && !withdrawalAddress.toLowerCase().startsWith("0x")) {
      withdrawalAddress = "0x" + withdrawalAddress;
    }

    window.eth2Deposit.generateBLSChange(
      props.folderPath,
      props.network,
      props.mnemonic,
      props.startIndex,
      props.btecIndices,
      props.btecCredentials,
      withdrawalAddress).then(() => {
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
      case 0: return (
        <SelectFolder setFolderPath={props.setFolderPath} folderPath={props.folderPath} setFolderError={setFolderError} folderError={folderError} setFolderErrorMsg={setFolderErrorMsg} folderErrorMsg={folderErrorMsg} modalDisplay={modalDisplay} setModalDisplay={setModalDisplay} />
      );
      case 1: return (
        <CreatingBTECFile />
      );
      case 2: return (
        <BTECFileCreated folderPath={props.folderPath} network={props.network} />
      );
      default:
        return null;
    }
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h1">
          Generate BLS to execution change
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

export default BTECGenerationWizard;