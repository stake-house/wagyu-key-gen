import React from 'react';
import { Yellow } from '../colors';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 380px;
  width: 420px;
  background: rgba(27, 38, 44, 0.95);
  border-radius: 20px;
  align-items: center;
`;

const Header = styled.div`
  font-size: 36px;
  margin-top: 30px;
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const Option = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 30px;
`;

const OptionInput = styled.input``;

const OptionLabel = styled.label`
  margin-left: 20px;
`;

const Submit = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${Yellow};
  width: 100px;
  height: 50px;
  border-radius: 10px;
  color: Black;
  align-self: flex-end;
  margin-right: 30px;
  margin-top: 35px;
`;


export const NetworkPicker = () => {
  return (
    <Container>
      <Header>Network</Header>

      <Options>
        <Option>
          <OptionInput type="radio" id="prater" name="network" value="prater" checked />
          <OptionLabel>Prater (Testnet)</OptionLabel>
        </Option>
        <Option>
          <OptionInput type="radio" id="pyrmont" name="network" value="pyrmont" />
          <OptionLabel>Pyrmont (Testnet)</OptionLabel>
        </Option>
        <Option>
          <OptionInput type="radio" id="mainnet" name="network" value="mainnet" />
          <OptionLabel>Mainnet</OptionLabel>
        </Option>
      </Options>
      <Submit>OK</Submit>
    </Container>
  )
}