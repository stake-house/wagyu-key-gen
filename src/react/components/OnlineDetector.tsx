import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import PermScanWifiIcon from "@material-ui/icons/PermScanWifi";
import React from "react";
import styled, { keyframes } from "styled-components";
import { Orange } from "../colors";

const FixedBox = styled(Box)`
  width: 50px;
  height: 50px;
  position: fixed;
  top: 10px;
  left: 10px;
`
const ErrorButton = styled(IconButton)`
  color: ${Orange};
`

const PulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(250, 30, 14, 0.7);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(250, 30, 14, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(250, 30, 14, 0);
  }
`

const PulsingIcon = styled(PermScanWifiIcon)`
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  color: ${Orange};
  animation: ${PulseAnimation} 3s infinite;
  border-radius: 1000px;
`

const PaddedText = styled(Typography)`
  margin-bottom: 8px;
`
const StyledDialogContent = styled(DialogContent)`
  min-height: 250px;
`

/**
 * This will add an event listener to detect the users internet connectivity.
 * If active, a pulsing warning icon will appear in the screen that when clicked will
 * show a dialog warning the user of the danger of internet connectivity
 * @returns the icon and dialog component to render if necessary
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
      <FixedBox hidden={!showWarning}>
        <ErrorButton onClick={() => setOpen(true)}>
          <PulsingIcon />
        </ErrorButton>
      </FixedBox>
      <Dialog
        open={open}
      >
        <DialogTitle>Internet Connection Detected</DialogTitle>
        <StyledDialogContent>
          <Grid container direction="column" spacing={3}>
            <Grid item>
              <PaddedText variant="body1">Being connected to the internet while using this tool drastically increases the risk of exposing your Secret Recovery Phrase.</PaddedText>
              <Typography variant="body1">You can avoid this risk by having a live OS such as Tails installed on a USB drive and run on a computer with network capabilities disabled.</Typography>
            </Grid>
            <Grid item>
              <PaddedText variant="body1">You can visit https://tails.net/install/ for instructions on how to download, install, and run Tails on a USB device.</PaddedText>
              <Typography variant="body1">If you have any questions you can get help at https://dsc.gg/ethstaker</Typography>
            </Grid>
          </Grid>
        </StyledDialogContent>
        <DialogActions>
          <Button
            color="secondary"
            onClick={() => onHideWarning()}
            variant="contained"
          >
            Hide Warning
          </Button>
          <Button
            color="primary"
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
