import { Snackbar } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import React from "react";
import { errors } from "../constants";

/**
 * This will add an event listener to detect the users internet connectivity.
 * If active, an alert will display notifying the user and explaining the security
 * concerns with using the tool online
 * @returns the snackbar component to render to the user if necessary
 */
export const OnlineDetector = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const updateOnlineStatus = () => {
    setOpen(navigator.onLine);
  };

  React.useEffect(() => {
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    // Only allow closing of the snackbar through the alert action
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "top"}}
        onClose={handleClose}
        open={open}
      >
        <Alert
          icon={false}
          onClose={handleClose}
          severity="error"
          variant="filled"
        >
          <AlertTitle>Internet Connection Detected</AlertTitle>
          {errors.ONLINE_ERROR}
        </Alert>
      </Snackbar>
    </>
  )
};
