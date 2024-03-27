import { Button, Link, Typography } from "@mui/material";
import { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { BTECContext } from "../BTECContext";
import WizardWrapper from "../components/WizardWrapper";
import { BTECFlow } from "../constants";

/**
 * Final step of the credentials generation flow.
 * Shows the user the location where the files were stored and provides
 * some additional information.
 */
const FinishCredentialsGeneration = () => {
  const { folderLocation } = useContext(BTECContext);
  const history = useHistory();

  useEffect(() => {
    if (!folderLocation) {
      history.replace("/");
    }

    // On browser back, go back to main page and refresh to clear navigation history
    const unblock = history.block(() => {
      unblock();
      history.push("/");
      window.location.reload();
    });
  }, []);

  /**
   * Will open a directory explorer where the credential change file was saved
   */
  const openKeyLocation = () => {
    window.bashUtils.findFirstFile(folderLocation, "bls_to_execution_change")
      .then((changeFile) => {
        let fileToLocate = folderLocation;
        if (changeFile !== "") {
          fileToLocate = changeFile;
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
      timelineItems={BTECFlow}
      title="Generate BLS to execution change"
    >
      <div className="tw-flex tw-flex-col tw-mx-28">
        <Typography variant="body1" align="left">
          Your BLS to execution change file has been created here:{" "}
          <Link
            display="inline"
            component="button"
            onClick={openKeyLocation}
          >
            {folderLocation}
          </Link>
        </Typography>


        <Typography className="tw-mt-16" variant="body1">
          There is a single file for this:
        </Typography>
        <Typography className="tw-text-cyan">
          BLS to execution file (ex. bls_to_execution_change-xxxxxxx.json)
        </Typography>
        <Typography variant="body2">
          This file contains your signature to add your withdrawal address on your validator(s). You can easily publish it on beaconcha.in website by using their <em>Broadcast Signed Messages</em> tool.
        </Typography>
        <Typography className="tw-text-gray">
          Note: Your clipboard will be cleared upon closing this application.
        </Typography>
      </div>
    </WizardWrapper>
  )
};

export default FinishCredentialsGeneration;
