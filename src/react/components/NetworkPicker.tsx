import { BackgroundLight, ButtonHover, Yellow } from '../colors';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@material-ui/core';
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
  background: ${BackgroundLight};
  margin: auto;
  margin-top: 150px;
`;

const Header = styled.div`
  font-size: 36px;
  margin-top: 30px;
  margin-bottom: 30px;
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
  handleCloseNetworkModal: () => void,
  setNetworkSelected: Dispatch<SetStateAction<string>>,
  networkSelected: string,
}

export const NetworkPicker = (props: NetworkPickerProps) => {

  const closePicker = () => {
    props.handleCloseNetworkModal();
  }

  const networkChanged = (selected: React.ChangeEvent<HTMLInputElement>) => {
    props.setNetworkSelected(selected.target.value);
  }

  return (
    <Container>
      <Header>Network</Header>
      {/* TODO: come up with a better way to pass selection back */}
      <FormControl component="fieldset">
        <RadioGroup aria-label="gender" name="gender1" value={props.networkSelected} onChange={networkChanged}>
          <FormControlLabel value={network.PRATER} control={<Radio />} label={network.PRATER} />
          <FormControlLabel value={network.PYRMONT} control={<Radio />} label={network.PYRMONT} />
          <FormControlLabel value={network.MAINNET} disabled control={<Radio />} label={network.MAINNET} />
        </RadioGroup>
      </FormControl>
      <Submit onClick={closePicker}>OK</Submit>
    </Container>
  )
}