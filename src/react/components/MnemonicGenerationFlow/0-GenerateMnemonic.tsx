import { Button } from '@material-ui/core';
import React, { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { createMnemonic } from '../../commands/Eth2Deposit';

const Container = styled.div`
`;

const Message = styled.div`
`;

type GenerateMnemonicProps = {
  step: number,
  setMnemonic: Dispatch<SetStateAction<string>>,
}

const GenerateMnemonic = (props: GenerateMnemonicProps) => {
  if (props.step == 0) {
    return (
      <Container>
        <Message>
          Yada yada yada offline keep this safe yada
        </Message>
      </Container>
    );
  }

  return (null);
}

export default GenerateMnemonic;
