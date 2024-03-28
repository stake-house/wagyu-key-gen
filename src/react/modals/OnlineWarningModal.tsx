import { Button, Typography } from "@mui/material";

import WagyuModal from "./WagyuModal";

interface OnlineWarningModalParams {
  onClose: () => void;
  onHideWarning: () => void;
  open: boolean;
}

/**
 * Modal to display to the user to explain the risks of using this tool with network connectivity
 */
const OnlineWarningModal = ({ onClose, onHideWarning, open }: OnlineWarningModalParams) => (
  <WagyuModal
    className="tw-w-[600px]"
    open={open}
  >
    <div className="tw-py-8 tw-px-4">
      <div className="tw-text-3xl tw-text-center tw-mb-8">Internet Connection Detected</div>
      <div className="tw-text-left tw-min-h-[250px]">
        <Typography className="tw-mb-2" variant="body1">
          Being connected to the internet while using this tool drastically increases the risk of exposing your Secret Recovery Phrase.
        </Typography>
        <Typography variant="body1">
          You can avoid this risk by having a live OS such as Tails installed on a USB drive and run on a computer with network capabilities disabled.
        </Typography>

        <Typography className="tw-mt-6 tw-mb-2" variant="body1">
          You can visit https://tails.net/install/ for instructions on how to download, install, and run Tails on a USB device.
        </Typography>
        <Typography variant="body1">
          If you have any questions you can get help at https://dsc.gg/ethstaker
        </Typography>
      </div>
      <div>
        <Button
          className="tw-mr-2"
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
      </div>
    </div>
  </WagyuModal>
);

export default OnlineWarningModal;
