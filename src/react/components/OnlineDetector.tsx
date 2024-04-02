import { Button, Typography } from "@mui/material";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import React from "react";

import OnlineWarningModal from "../modals/OnlineWarningModal";

/**
 * This will add an event listener to detect the users internet connectivity.
 * If active, a pulsing warning icon with text will appear on the screen that
 * when clicked will show a modal to warn the user of the danger of internet
 * connectivity.
 */
export const OnlineDetector = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [showWarning, setShowWarning] = React.useState<boolean>(false);

  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      setShowWarning(true);
      window.removeEventListener("online", updateOnlineStatus);
    }
  };

  React.useEffect(() => {
    window.addEventListener("online", updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
    };
  }, []);

  const onHideWarning = () => {
    setOpen(false);
    setShowWarning(false);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      {showWarning && (
        <Button className="tw-w-[210px] tw-h-[50px] tw-fixed tw-top-6 tw-left-2 tw-cursor-pointer tw-text-orange" onClick={() => setOpen(true)}>
          <div className="tw-absolute tw-w-0 tw-h-0 tw-left-6 tw-bg-[rgba(250, 30, 14, 0)] tw-animate-OnlinePulse tw-rounded-full" />
          <PermScanWifiIcon className="tw-mr-1 tw-z-10"/>
          <Typography variant="body1">Internet Detected</Typography>
        </Button>
      )}

      <OnlineWarningModal
        onClose={onClose}
        onHideWarning={onHideWarning}
        open={open}
      />
    </>
  )
};
