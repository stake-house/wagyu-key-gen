import { Background, ButtonHover, Yellow } from '../colors';
import React, { Dispatch, SetStateAction } from 'react';

import { network } from '../constants';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 380px;
  width: 420px;
  background: rgba(27, 38, 44, 0.95);
  border-radius: 20px;
  align-items: center;
  background: ${Background};
  margin: auto;
  margin-top: 150px;
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
  margin-top: 35px;

  transition: 250ms background-color ease;
  cursor: pointer;

  &:hover {
    background-color: ${ButtonHover};
  }
`;


type NetworkPickerProps = {
  setShowNetworkPicker: Dispatch<SetStateAction<boolean>>,
  setNetworkSelected: Dispatch<SetStateAction<string>>,
  networkSelected: string,
}

export const NetworkPicker = (props: NetworkPickerProps) => {

  const closePicker = () => {
    props.setShowNetworkPicker(false);
  }

  const networkChanged = (selected: string) => {
    props.setNetworkSelected(selected);
  }

  return (
    <Container>
      <Header>Network</Header>

      {/* TODO: come up with a better way to pass selection back */}
      <Options>
        <Option>
          <OptionInput type="radio" id="prater" name="network" value="prater" checked={props.networkSelected == network.PRATER} onClick={e => networkChanged(network.PRATER)} />
          <OptionLabel>Prater (Testnet)</OptionLabel>
        </Option>
        <Option>
          <OptionInput type="radio" id="pyrmont" name="network" value="pyrmont" checked={props.networkSelected == network.PYRMONT} onClick={e => networkChanged(network.PYRMONT)} />
          <OptionLabel>Pyrmont (Testnet)</OptionLabel>
        </Option>
        <Option>
          <OptionInput type="radio" id="mainnet" name="network" value="mainnet" checked={props.networkSelected == network.MAINNET} onClick={e => networkChanged(network.MAINNET)} />
          <OptionLabel>Mainnet</OptionLabel>
        </Option>
      </Options>
      <Submit onClick={closePicker}>OK</Submit>
    </Container>
  )
}