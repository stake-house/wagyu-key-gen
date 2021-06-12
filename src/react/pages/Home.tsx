import {
  Black,
  ButtonColor,
  ButtonHover,
  Gray4,
  Heading,
  MainContent,
  Yellow,
} from "../colors";
import { Link, withRouter } from "react-router-dom";
import React, { useState } from "react";

import { KeyIcon } from "../components/icons/KeyIcon";
import { NetworkPicker } from "../components/NetworkPicker";
import {network} from "../constants";
import { shell } from "electron";
import styled from "styled-components";
import { TextField } from "@material-ui/core";
import { Button } from '@material-ui/core';


type ContainerProps = {
  showNetworkPicker: boolean,
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const Network = styled.div`
  color: ${Gray4};
  margin-top: 35px;
  margin-right: 35px;
  align-self: flex-end;
`;

const LandingHeader = styled.div`
  font-size: 36px;
  margin-top: 50px;
  margin-bottom: 70px;
  text-align: center;
`;

const Content = styled.div`
  color: ${MainContent};
  margin-top: 90px;
`;

const Links = styled.div`
  margin-top: 30px;
`;

const StyledLink = styled.span`
  cursor: pointer;
  color: ${Yellow};
`;

const Options = styled.div`
  display: flex;
  width: 400px;
  align-items: center;
  justify-content: space-around;
`;

const EnterButton = styled(Link)`
  color: ${Black};
  display: flex;
  flex-direction: row;
  text-align: center;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 120px;
  background-color: ${Yellow};
  border-radius: 10px;
  text-decoration: none;

  transition: 250ms background-color ease;
  cursor: pointer;
  margin-top: 80px;

  &:hover {
    background-color: ${ButtonHover};
  }
`;

// const StyledTextField = styled(TextField)`
//   label {
//     color: white;
//   }
//   label.focused {
//     color: white;
//   }
//   .MuiOutlinedInput-root {
//     fieldset {
//       border-color: ${Yellow};
//     }
//     &:hover fieldset {
//       border-color: ${Yellow};
//     }
//     &.Mui-focused fieldset {
//       border-color: ${Yellow};
//     }
//   }
// `;


const Home = () => {

  const [networkSelected, setNetworkSelected] = useState(network.PRATER)
  const [showNetworkPicker, setShowNetworkPicker] = useState(false)

  const sendToDocs = () => {
    shell.openExternal("https://github.com/stake-house/wagyu-key-gen");
  }

  const sendToGithub = () => {
    shell.openExternal("https://github.com/stake-house/wagyu-key-gen");
  }

  const sendToDiscord = () => {
    shell.openExternal("https://invite.gg/ethstaker");
  }

  const toggleShowNetworkPicker = () => {
    setShowNetworkPicker(!showNetworkPicker);
  }

  return (
    <Container>
      <Network><StyledLink onClick={toggleShowNetworkPicker}>{networkSelected}</StyledLink></Network>
      <LandingHeader>Welcome!</LandingHeader>
      <TextField id="number-of-keys" label="Number of Keys" variant="outlined" type="number" color="primary" />
      <Button variant="contained" color="primary">test</Button>
      <KeyIcon />
      <Content>Your key generator for Ethereum 2.0</Content>
      <Links>
        <StyledLink onClick={sendToDocs}>Docs</StyledLink> | <StyledLink onClick={sendToGithub}>Github</StyledLink> | <StyledLink onClick={sendToDiscord}>Discord</StyledLink>
      </Links>
      <Options>
        <EnterButton to={{
            pathname: "/mnemonicgeneration",
            state: {
              network: networkSelected,
            },
        }}>Create New Mnemonic (?)</EnterButton>
        <EnterButton to={{
            pathname: "/mnemonicimport",
            state: {
              network: networkSelected,
            },
        }}>Use Existing Mnemonic (?)</EnterButton>
      </Options>



      <ModalBackground showNetworkPicker={showNetworkPicker}>
        <NetworkPicker setShowNetworkPicker={setShowNetworkPicker} setNetworkSelected={setNetworkSelected} networkSelected={networkSelected}></NetworkPicker>
      </ModalBackground>
    </Container>
  );
};
export default withRouter(Home);
