import {
  Black,
  Button,
  ButtonHover,
  Heading,
  MainContent,
} from "../colors";
import { Link, withRouter } from "react-router-dom";

import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LandingHeader = styled.div`
  font-weight: 700;
  font-size: 35;
  margin-top: 120;
  color: ${Heading};
  max-width: 550;
  text-align: center;
`;

const Content = styled.div`
  color: ${MainContent};
  margin-top: 40;
  max-width: 650;
`;

const EnterButton = styled(Link)`
  color: ${Black};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 24;
  background-color: ${Button};
  padding: 16 24;
  border-radius: 10%;
  text-decoration: none;

  transition: 250ms background-color ease;
  cursor: pointer;
  margin-top: 60;

  &:hover {
    background-color: ${ButtonHover};
  }
`;

const Home = () => {
  return (
    <Container>
      <LandingHeader>Welcome to Wagyu Key Gen</LandingHeader>
      <Content>
        Your key generator for Ethereum 2.0
        <br />
        <br/>
        <br/>
      </Content>
      <EnterButton to="/mnemonic">Enter</EnterButton>
    </Container>
  );
};
export default withRouter(Home);
