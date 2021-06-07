import React, { Dispatch, SetStateAction, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
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
        <input type="text" onChange={updateInputMnemonic}/>
        { props.error ? props.error : null }
      </Container>
    );
  }

  return (null);
}

export default VerifyMnemonic;
