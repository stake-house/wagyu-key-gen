import { Button, Typography } from "@mui/material";
import WizardWrapper from "../components/WizardWrapper";
import { BTECFlow, BTECImportPath, FinishCredentialsPath } from "../constants";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../GlobalContext";
import { BTECContext } from "../BTECContext";
import Loader from "../components/Loader";
import FolderSelector from "../components/FolderSelector";
import { useHistory } from "react-router-dom";

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
      history.replace(BTECImportPath);
    }
  }, []);

  const onFolderSelect = (folder: string) => {
    setSelectedFolder(folder);
  };

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
      history.push(FinishCredentialsPath);
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
