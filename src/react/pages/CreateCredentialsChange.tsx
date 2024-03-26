import { Button, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { BTECContext } from "../BTECContext";
import FolderSelector from "../components/FolderSelector";
import Loader from "../components/Loader";
import WizardWrapper from "../components/WizardWrapper";
import { BTECFlow, paths } from "../constants";
import { GlobalContext } from "../GlobalContext";

/**
 * Allows the user to select a folder where the credentials will be saved
 * and after which will attempt to generate the credential change and save
 * to the specified folder
 */
const CreateCredentialsChange = () => {
  const { network } = useContext(GlobalContext);
  const {
    btecCredentials,
    btecIndices,
    setFolderLocation,
    index,
    mnemonic,
    withdrawalAddress,
  } = useContext(BTECContext);
  const history = useHistory();

  const [creatingCredentialsChange, setCreatingCredentialsChange] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");

  useEffect(() => {
    if (!mnemonic) {
      history.replace(paths.BTEC_IMPORT);
    }
  }, []);

  const onFolderSelect = (folder: string) => {
    setSelectedFolder(folder);
  };

  /**
   * Attempts to generate the credentials change and if successful send the user
   * to the final step of the flow
   */
  const handleBTECFileGeneration = () => {
    setCreatingCredentialsChange(true);
    let appendedWithdrawalAddress = withdrawalAddress;

    if (withdrawalAddress != "" && !withdrawalAddress.toLowerCase().startsWith("0x")) {
      appendedWithdrawalAddress = "0x" + withdrawalAddress;
    }

    window.eth2Deposit.generateBLSChange(
      selectedFolder,
      network,
      mnemonic,
      index,
      btecIndices,
      btecCredentials,
      appendedWithdrawalAddress,
    ).then(() => {
      setFolderLocation(selectedFolder);
      history.push(paths.FINISH_CREDENTIALS);
    }).catch((error) => {
      const errorMsg = ('stderr' in error) ? error.stderr : error.message;
      setGenerationError(errorMsg);
      setCreatingCredentialsChange(false);
    });
  }

  const onBackClick = () => {
    setSelectedFolder("");
    history.goBack();
  };

  const onNextClick = () => {
    if (selectedFolder) {
      handleBTECFileGeneration();
    }
  };

  return (
    <WizardWrapper
      actionBarItems={creatingCredentialsChange ? [] : [
        <Button variant="contained" color="primary" onClick={() => onBackClick()} tabIndex={3}>Back</Button>,
        <Button variant="contained" color="primary" disabled={!selectedFolder} onClick={() => onNextClick()} tabIndex={2}>Create</Button>,
      ]}
      activeTimelineIndex={2}
      timelineItems={BTECFlow}
      title="Generate BLS to execution change"
    >
      { creatingCredentialsChange ? (
        <Loader message="Creating your BLS to execution change file." />
      ) : (
        <div className="tw-flex tw-flex-col tw-items-center tw-gap-4">
          <Typography>Choose a folder where we should save your BLS to execution change file.</Typography>

          <FolderSelector onFolderSelect={onFolderSelect} />

          {selectedFolder && <Typography>You've selected: {selectedFolder}</Typography>}

          {generationError && <Typography color="error">{generationError}</Typography>}
        </div>
      )}
    </WizardWrapper>
  )
};

export default CreateCredentialsChange;
