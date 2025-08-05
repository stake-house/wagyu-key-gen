import {
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";

import { GlobalContext } from "../GlobalContext";
import { Network } from "../types";
import WagyuModal from "./WagyuModal";

interface NetworkPickerModalParams {
  onClose: () => void;
  showModal: boolean;
}

/**
 * Modal to allow the user to pick the Ethereum Network
 */
const NetworkPickerModal = ({onClose, showModal}: NetworkPickerModalParams) => {
  const { network, setNetwork } = useContext(GlobalContext);
  const [formNetwork, setFormNetwork] = useState<Network>(Network.MAINNET);

  useEffect(() => {
    if (network) {
      setFormNetwork(network);
    }
  }, [network, showModal]);

  const onNetworkChange = (selected: React.ChangeEvent<HTMLInputElement>) => {
    const selectedNetwork = selected.target.value as Network;

    if (selectedNetwork) {
      setFormNetwork(selectedNetwork);
    }
  };

  const onSubmit = () => {
    if (formNetwork) {
      setNetwork(formNetwork);
    }

    onClose();
  };

  return (
    <WagyuModal
      className="tw-w-[350px] tw-h-[444px]"
      open={showModal}
    >
      <div>
        <div className="tw-text-4xl tw-my-7">Network</div>
        <FormControl variant="standard" focused>
          <RadioGroup aria-label="gender" name="gender1" value={formNetwork} onChange={onNetworkChange}>
            <FormControlLabel value={Network.MAINNET} control={<Radio />} label={Network.MAINNET} />
            <Divider />
            <Typography className="tw-text-xl tw-mt-5 tw-mb-4">Testnets</Typography>
            <FormControlLabel value={Network.HOODI} control={<Radio />} label={Network.HOODI} />
          </RadioGroup>

          <Button
            className="tw-mt-9"
            color="primary"
            onClick={onSubmit}
            variant="contained"
            tabIndex={1}
          >
            OK
          </Button>
        </FormControl>
      </div>
    </WagyuModal>
  )
};

export default NetworkPickerModal;
