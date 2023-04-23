import { useHistory } from "react-router-dom";
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { Container, Grid, Modal, Tooltip, Typography } from "@material-ui/core";
import { Button } from '@material-ui/core';
import { KeyIcon } from "../components/icons/KeyIcon";
import { NetworkPicker } from "../components/NetworkPicker";
import { ReuseMnemonicActionPicker } from "../components/ReuseMnemonicActionPicker";
import { tooltips } from "../constants";
import { Network, StepSequenceKey, ReuseMnemonicAction } from '../types'
import VersionFooter from "../components/VersionFooter";

const StyledMuiContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const NetworkDiv = styled.div`
  margin-top: 35px;
  margin-right: 35px;
  align-self: flex-end;
  color: gray;
`;

const LandingHeader = styled(Typography)`
  font-size: 36px;
  margin-top: 15px;
  margin-bottom: 20px;
`;

const SubHeader = styled(Typography)`
  margin-top: 10px;
  text-align: center;
`;

const Links = styled.div`
  margin-top: 20px;
`;

const InfoLabel = styled.span`
  color: gray;
`;

const OptionsGrid = styled(Grid)`
  margin-top: 20px;
  align-items: center;
`;

const Dotted = styled.span`
  text-decoration-line: underline;
`;

type HomeProps = {
  network: Network,
  setNetwork: Dispatch<SetStateAction<Network>>
}

/**
 * Home page and entry point of the app.  This page displays general information
 * and options for a user to create a new secret recovery phrase or use an 
 * existing one.
 * 
 * @param props passed in data for the component to use
 * @returns the react element to render
 */
const Home: FC<HomeProps> = (props): ReactElement => {
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkModalWasOpened, setNetworkModalWasOpened] = useState(false);
  const [showReuseMnemonicModal, setShowReuseMnemonicModal] = useState(false);
  const [createMnemonicSelected, setCreateMnemonicSelected] = useState(false);
  const [useExistingMnemonicSelected, setUseExistingMnemonicSelected] = useState(false);

  let history = useHistory();

  const handleOpenNetworkModal = () => {
    setShowNetworkModal(true);
    setNetworkModalWasOpened(true);
  }

  const handleCloseNetworkModal = (event: object, reason: string) => {
    if (reason == 'submitClick') {
      setShowNetworkModal(false);

      if (createMnemonicSelected) {
        handleCreateNewMnemonic();
      } else if (useExistingMnemonicSelected) {
        handleUseExistingMnemonic();
      }
    }
  }

  const handleOpenReuseMnemonicModal = () => {
    setShowReuseMnemonicModal(true);
  }

  const handleReuseMnemonicModalSubmitClick = (action: ReuseMnemonicAction) => {
    let pathname = '';

    switch (action) {
      case ReuseMnemonicAction.RegenerateKeys:

        pathname = `/wizard/${StepSequenceKey.MnemonicImport}`;

        break;
      case ReuseMnemonicAction.GenerateBLSToExecutionChange:

        pathname = `/wizard/${StepSequenceKey.BLSToExecutionChangeGeneration}`;

        break;
      case ReuseMnemonicAction.GeneratePreSignExitTransaction:

        pathname = `/wizard/${StepSequenceKey.PreSignExitTransactionGeneration}`;

        break;
    }

    history.push({ pathname });

  }

  const handleCloseReuseMnemonicModal = (event: object, reason: string) => {
    setShowReuseMnemonicModal(false);
  }

  const handleCreateNewMnemonic = () => {
    setCreateMnemonicSelected(true);

    if (!networkModalWasOpened) {
      handleOpenNetworkModal();
    } else {
      const location = {
        pathname: `/wizard/${StepSequenceKey.MnemonicGeneration}`
      }

      history.push(location);
    }
  }

  const handleUseExistingMnemonic = () => {
    setUseExistingMnemonicSelected(true);

    if (!networkModalWasOpened) {
      handleOpenNetworkModal();
    } else {

      handleOpenReuseMnemonicModal();

    }
  }

  const tabIndex = (priority: number) => showNetworkModal ? -1 : priority;

  return (
    <StyledMuiContainer>
      <NetworkDiv>
        Select Network: <Button color="primary" onClick={handleOpenNetworkModal} tabIndex={tabIndex(1)}>{props.network}</Button>
      </NetworkDiv>
      <Modal
        open={showNetworkModal}
        onClose={handleCloseNetworkModal}
      >
        {/* Added <div> here per the following link to fix error https://stackoverflow.com/a/63521049/5949270 */}
        <div>
          <NetworkPicker handleCloseNetworkModal={handleCloseNetworkModal} setNetwork={props.setNetwork} network={props.network}></NetworkPicker>
        </div>
      </Modal>

      <Modal
        open={showReuseMnemonicModal}
        onClose={handleCloseReuseMnemonicModal}
      >
        {/* Added <div> here per the following link to fix error https://stackoverflow.com/a/63521049/5949270 */}
        <div>
          <ReuseMnemonicActionPicker handleCloseReuseMnemonicModal={handleCloseReuseMnemonicModal} handleReuseMnemonicModalSubmitClick={handleReuseMnemonicModalSubmitClick} ></ReuseMnemonicActionPicker>
        </div>
      </Modal>

      <LandingHeader variant="h1">Welcome!</LandingHeader>
      <KeyIcon />
      <SubHeader>Your key generator for staking on Ethereum.<br/>You should run this tool&nbsp;
      <Tooltip title={tooltips.OFFLINE}><Dotted>offline</Dotted></Tooltip> for your own security.</SubHeader>

      <Links>
        <InfoLabel>Github:</InfoLabel> https://github.com/stake-house/wagyu-key-gen
        <br />
        <InfoLabel>Support:</InfoLabel> https://discord.io/ethstaker
      </Links>

      <OptionsGrid container spacing={2} direction="column">
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleCreateNewMnemonic} tabIndex={tabIndex(1)}>
            Create New Secret Recovery Phrase
          </Button>
        </Grid>
        <Grid item>
          <Tooltip title={tooltips.IMPORT_MNEMONIC}>
            <Button style={{color: "gray"}} size="small" onClick={handleUseExistingMnemonic} tabIndex={tabIndex(1)}>
              Use Existing Secret Recovery Phrase
            </Button>
          </Tooltip>
        </Grid>
      </OptionsGrid>
      <VersionFooter />
    </StyledMuiContainer>
  );
};

export default Home;
