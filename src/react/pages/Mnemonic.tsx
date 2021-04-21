import { Heading, MainContent } from '../colors';

import Footer from '../components/Footer';
import React from 'react';
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

const Mnemonic = () => {
  return (
    <Container>
      <LandingHeader>Mnemonic</LandingHeader>
      <Content>
        Lorem ipsum
        <br />
        <br />
        <br />
        ...
      </Content>
      <Footer backLink={"/"} backLabel={"Home"} nextLink={""} nextLabel={""} />
    </Container>
  );
}
export default Mnemonic;