import {
  Black,
  Button,
  ButtonHover,
  Heading,
  MainContent,
  Yellow,
} from "../colors";
import { Link, withRouter } from "react-router-dom";

import { KeyIcon } from "../components/icons/KeyIcon";
import React from "react";
import { shell } from "electron";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LandingHeader = styled.div`
  font-size: 36px;
  margin-top: 100px;
  margin-bottom: 70px;
  text-align: center;
`;

const Content = styled.div`
  color: ${MainContent};
  margin-top: 90px;
`;

const Links = styled.div`
  color: ${Yellow};
  margin-top: 30px;
`;

const StyledLink = styled.span`
  color: ${Heading};
  cursor: pointer;
  color: inherit;
`;

const EnterButton = styled(Link)`
  color: ${Black};
  display: flex;
  flex-direction: row;
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

const Home = () => {

  const sendToDocs = () => {
    shell.openExternal("https://github.com/stake-house/wagyu-key-gen");
  }

  const sendToGithub = () => {
    shell.openExternal("https://github.com/stake-house/wagyu-key-gen");
  }

  const sendToDiscord = () => {
    shell.openExternal("https://invite.gg/ethstaker");
  }

  return (
    <Container>
      <LandingHeader>Welcome!</LandingHeader>
      <KeyIcon />
      <Content>Your key generator for Ethereum 2.0</Content>
      <Links>
        <StyledLink onClick={sendToDocs}>Docs</StyledLink> | <StyledLink onClick={sendToGithub}>Github</StyledLink> | <StyledLink onClick={sendToDiscord}>Discord</StyledLink>
      </Links>
      <EnterButton to="/mnemonic">Enter</EnterButton>
    </Container>
  );
};
export default withRouter(Home);
