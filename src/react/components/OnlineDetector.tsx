import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@material-ui/core";
import PermScanWifiIcon from "@material-ui/icons/PermScanWifi";
import React from "react";
import styled, { keyframes } from "styled-components";
import { BackgroundLight, Orange } from "../colors";

const FixedErrorButton = styled(Button)`
  width: 210px;
  height: 50px;
  position: fixed;
  top: 26px;
  left: 10px;
  cursor: pointer;
  color: ${Orange};
`

const PulseAnimation = keyframes`
  0% {
    background-color: rgba(250, 30, 14, 0.7);
    width: 0px;
    height: 0px;
  }

  70% {
    background-color: rgba(250, 30, 14, 0);
    width: 50px;
    height: 50px;
    margin: -25px;
  }

  100% {
    background-color: rgba(250, 30, 14, 0);
    width: 60px;
    height: 60px;
    margin: -30px;
  }
`

const PusleCircle = styled(Box)`
  position: absolute;
  width: 0px;
  height: 0px;
  left: 23px;
  background-color: rgba(250, 30, 14, 0);
  animation: ${PulseAnimation} 3s infinite;
  border-radius: 1000px;
`

const ErrorIcon = styled(PermScanWifiIcon)`
  margin-right: 6px;
  z-index: 1;
`

const StyledDialog = styled(Dialog)`
  & .MuiPaper-root {
    border-radius: 20px;
    align-items: center;
    background: ${BackgroundLight};
    margin: auto;
    padding: 20px 0px;
  }
`

const StyledDialogTitle = styled(DialogTitle)`
  & .MuiTypography-root {
    font-size: 30px;
  }
`

const StyledDialogContent = styled(DialogContent)`
  min-height: 250px;
`

const PaddedText = styled(Typography)`
  margin-bottom: 8px;
`

/**
 * This will add an event listener to detect the users internet connectivity.
 * If active, a pulsing warning icon with text will appear on the screen that
 * when clicked will show a dialog warning the user of the danger of internet
 * connectivity.
 *
 * @returns the warning and dialog component to render if necessary
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
        <FixedErrorButton onClick={() => setOpen(true)}>
          <PusleCircle />
          <ErrorIcon />
          <Typography variant="body1">Internet Detected</Typography>
        </FixedErrorButton>
      )}

      <StyledDialog
        open={open}
      >
        <StyledDialogTitle>Internet Connection Detected</StyledDialogTitle>
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
      </StyledDialog>
    </>
  )
};
