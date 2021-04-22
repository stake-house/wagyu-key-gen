import {
  Black,
  Button,
  ButtonHover,
  Heading,
  MainContent
} from '../colors';

import Footer from '../components/Footer';
import React, { useState } from 'react';

import { createMnemonic } from "../commands/Eth2Deposit";

import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height:100vh;
`;

const LandingHeader = styled.div`
  font-weight: 700;
  font-size: 35;
  margin-top: 50;
  color: ${Heading};
  max-width: 550;
  flex-grow:1;
`;


const Content = styled.div`
  color: ${MainContent};
  margin-top: 20;
  width: 650;
  flex-grow: 6;
`;

const CallButton = styled.span`
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

const Mnemonic = () => {
  const [mnemonic, setMnemonic] = useState("");

  const uiCreateMnemonic = () => {
    setMnemonic(createMnemonic('english'));
  }
  
  return (
    <Container>
      <LandingHeader>Mnemonic</LandingHeader>
      <Content>
        Lorem ipsum
        <br />
        <br />
        <br />
        ...
        <p>{mnemonic}</p>
      </Content>
      <CallButton onClick={uiCreateMnemonic}>Create Mnemonic</CallButton>
      <Footer backLink={"/"} backLabel={"Home"} nextLink={""} nextLabel={""} />
    </Container>
  );
}
export default Mnemonic;