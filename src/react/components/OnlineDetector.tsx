import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import React from "react";

/**
 * This will add an event listener to detect the users internet connectivity.
 * If active, a dialog will appear notifying the user of the concerns with
 * running the tool in an online manner
 * @returns the dialog component to render to the user if necessary
 */
export const OnlineDetector = () => {
  const [acknowledge, setAcknowledge] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);

  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      setOpen(true);
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

  const onAcknowledgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAcknowledge(event.target.checked);
  };

  const onClose = () => {
    if (acknowledge) {
      setOpen(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
      >
        <DialogTitle>Internet Connection Detected</DialogTitle>
        <DialogContent>
          <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat</Typography>
          <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat</Typography>
          <FormControlLabel
            control={
              <Checkbox checked={acknowledge} onChange={onAcknowledgeChange}/>
            }
            label="Click here to acknowledge the risk you are taking"
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            disabled={!acknowledge}
            onClick={() => onClose()}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
};
