import { useHistory } from "react-router-dom";
import { CreateMnemonicFlow, ExistingMnemonicFlow, FinishExistingPath } from "../constants";
import { useContext, useEffect } from "react";
import { KeyCreationContext } from "../KeyCreationContext";
import WizardWrapper from "../components/WizardWrapper";
import { Button, Link, Typography } from "@mui/material";

const FinishKeyGeneration = () => {
  const { folderLocation } = useContext(KeyCreationContext);
  const history = useHistory();
  const usingExistingFlow = history.location.pathname === FinishExistingPath;

  useEffect(() => {
    if (!folderLocation) {
      history.replace("/");
    }
  }, []);

  const openKeyLocation = () => {
    window.bashUtils.findFirstFile(folderLocation, "keystore")
      .then((keystoreFile) => {
        let fileToLocate = folderLocation;
        if (keystoreFile != "") {
          fileToLocate = keystoreFile;
        }
        window.electronAPI.shellShowItemInFolder(fileToLocate);
    });
  };

  const onClose = () => {
    window.electronAPI.ipcRendererSendClose();
  };

  return (
    <WizardWrapper
      actionBarItems={[<Button variant="contained" color="primary" onClick={() => onClose()} tabIndex={2}>Close</Button>]}
      activeTimelineIndex={3}
      timelineItems={usingExistingFlow ? ExistingMnemonicFlow : CreateMnemonicFlow}
      title="Create Keys"
    >
      <div className="tw-flex tw-flex-col tw-gap-2 tw-ml-28">
        <Typography variant="body1">
          Your keys have been created here:{" "}
          <Link
            display="inline"
            component="button"
            onClick={openKeyLocation}
          >
            {folderLocation}
          </Link>
        </Typography>

        <div>
          <Typography variant="body1">
            There are two different files, here is a description of each:
          </Typography>
          <Typography className="tw-text-cyan">
            Keystore file(s) (ex. keystore-xxxxxxx.json)
          </Typography>
          <Typography variant="body2">
            This file controls your ability to sign transactions.  It will be required to set up your validator.  Do not share with anyone.  It can be recreated from your secret recovery phrase if necessary.
          </Typography>
          <Typography className="tw-text-cyan">
            Deposit data file(s) (ex. deposit_data-xxxxxx.json)
          </Typography>
          <Typography variant="body2">
            This file represents public information about your validator.  It will be required to execute your deposit through the Ethereum Launchpad.  It can be recreated from your secret recovery phrase if necessary.
          </Typography>
        </div>

        <div>
          <Typography className="tw-text-cyan">Secret Recovery Phrase (24 words)</Typography>
          <Typography variant="body2">
            This was the first thing you created.  It is also known as a "mnemonic" or "seed phrase".  You'll need this to withdraw your funds.  Keep multiple copies in different physical locations safe from theft, fire, water and other hazards. Keep it private.  There is no way to recover this.
          </Typography>
          <Typography className="tw-text-gray">
            Note: Your clipboard will be cleared upon closing this application.
          </Typography>
        </div>
      </div>
    </WizardWrapper>
  );
};

export default FinishKeyGeneration;
