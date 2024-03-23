import { Box, Button, Divider, FormControl, FormControlLabel, Modal, Radio, RadioGroup, Typography, styled } from "@mui/material";
import { Network } from "../types";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../globalContext";

interface NetworkPickerModalParams {
  onClose: () => void;
  showModal: boolean;
}

const Header = styled(Box)`
  font-size: 36px;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const SubHeader = styled(Typography)`
  font-size: 20px;
  margin-top: 20px;
  margin-bottom: 15px;
`;

const Submit = styled(Button)`
  margin: 35px auto 0;
  margin-top: 35px;
`;

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
    <Modal
      open={showModal}
      onClose={onClose}
    >
      <div>
        <Header>Network</Header>
        <FormControl variant="standard" focused>
          <RadioGroup aria-label="gender" name="gender1" value={formNetwork} onChange={onNetworkChange}>
            <FormControlLabel value={Network.MAINNET} control={<Radio />} label={Network.MAINNET} />
            <Divider />
            <SubHeader>Testnets</SubHeader>
            <FormControlLabel value={Network.HOLESKY} control={<Radio />} label={Network.HOLESKY} />
            <FormControlLabel value={Network.GOERLI} control={<Radio />} label={Network.GOERLI} />
          </RadioGroup>

          <Submit
            color="primary"
            onClick={onSubmit}
            variant="contained"
            tabIndex={1}
          >
            OK
          </Submit>
        </FormControl>
      </div>
    </Modal>
  )
};

export default NetworkPickerModal;
