import { TextField } from '@material-ui/core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

type VerifyMnemonicProps = {
  step: number,
  setVerifyMnemonic: Dispatch<SetStateAction<string>>,
  error: string,
}

const VerifyMnemonic = (props: VerifyMnemonicProps) => {

  const updateInputMnemonic = (e: React.FormEvent<HTMLInputElement>) => {
    props.setVerifyMnemonic(e.currentTarget.value);
  }

  if (props.step == 2) {
    return (
      <Container>
        VerifyMnemonic
        <TextField id="mnemonic" label="Mnemonic" variant="outlined" onChange={updateInputMnemonic} />
        { props.error ? props.error : null }
      </Container>
    );
  }

  return (null);
}

export default VerifyMnemonic;
