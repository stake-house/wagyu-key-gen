import { useHistory, withRouter, RouteComponentProps } from "react-router-dom";
import React, { FC, ReactElement, useState, Dispatch, SetStateAction } from "react";
import { shell } from "electron";
import styled from "styled-components";
import { Container, Grid, Modal, Tooltip, Typography } from "@material-ui/core";
import { Button } from '@material-ui/core';
import { KeyIcon } from "../components/icons/KeyIcon";
import { NetworkPicker } from "../components/NetworkPicker";
import { tooltips } from "../constants";
import { Network, StepSequenceKey } from '../types'

type ContainerProps = {
  showNetworkPicker: boolean
}

const ModalBackground = styled.div`
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */

  ${(props: ContainerProps) => {
    if (props.showNetworkPicker) {
      return `
        display: block;
      `;
    } else {
      return `
        display: none;
      `;
    }
  }}
`;

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
  margin-top: 50px;
  margin-bottom: 70px;
`;

const SubHeader = styled(Typography)`
  margin-top: 110px;
`;

const Links = styled.div`
  margin-top: 20px;
`;

const StyledLink = styled(Typography)`
  cursor: pointer;
  display: inline;
`;

const OptionsGrid = styled(Grid)`
  margin-top: 55px;
  align-items: center;
`;

type RouteProps = RouteComponentProps<{}, any, {}>;

type HomeProps = {
  network: Network,
  setNetwork: Dispatch<SetStateAction<Network>>
}

const Home: FC<HomeProps & RouteProps> = (props): ReactElement => {
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkModalWasOpened, setNetworkModalWasOpened] = useState(false);
  const [createMnemonicSelected, setCreateMnemonicSelected] = useState(false);
  const [useExistingMnemonicSelected, setUseExistingMnemonicSelected] = useState(false);

  let history = useHistory();

  const sendToDocs = () => {
    shell.openExternal("https://github.com/stake-house/wagyu-key-gen");
  }

  const sendToGithub = () => {
    shell.openExternal("https://github.com/stake-house/wagyu-key-gen");
  }

  const sendToDiscord = () => {
    shell.openExternal("https://invite.gg/ethstaker");
  }

  const handleOpenNetworkModal = () => {
    setShowNetworkModal(true);
    setNetworkModalWasOpened(true);
  }

  const handleCloseNetworkModal = () => {
    setShowNetworkModal(false);

    if (createMnemonicSelected) {
      handleCreateNewMnemonic();
    } else if (useExistingMnemonicSelected) {
      handleUseExistingMnemonic();
    }
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
      const location = {
        pathname: `/wizard/${StepSequenceKey.MnemonicImport}`
      }
  
      history.push(location);
    }
  }

  return (
    <StyledMuiContainer>
      <NetworkDiv><Button color="primary" onClick={handleOpenNetworkModal}>{props.network}</Button></NetworkDiv>
      <Modal
        open={showNetworkModal}
        onClose={handleCloseNetworkModal}
      >
        <NetworkPicker handleCloseNetworkModal={handleCloseNetworkModal} setNetwork={props.setNetwork} network={props.network}></NetworkPicker>
      </Modal>

      <LandingHeader variant="h1">Welcome!</LandingHeader>
      <KeyIcon />
      <SubHeader>Your key generator for Ethereum 2.0</SubHeader>

      <Links>
        <StyledLink display="inline" color="primary" onClick={sendToDocs}>Docs</StyledLink>
        &nbsp;|&nbsp;
        <StyledLink display="inline" color="primary" onClick={sendToGithub}>Github</StyledLink>
        &nbsp;|&nbsp;
        <StyledLink display="inline" color="primary" onClick={sendToDiscord}>Discord</StyledLink>
      </Links>

      <OptionsGrid container spacing={2} direction="column">
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleCreateNewMnemonic}>
            Create New Mnemonic
          </Button>
        </Grid>
        <Grid item>
          <Tooltip title={tooltips.IMPORT_MNEMONIC}>
            <Button style={{color: "gray"}} size="small" onClick={handleUseExistingMnemonic}>
              Use Existing Mnemonic
            </Button>
          </Tooltip>
        </Grid>
      </OptionsGrid>
    </StyledMuiContainer>
  );
};
export default withRouter(Home);
