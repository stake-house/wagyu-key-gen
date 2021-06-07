import { Tooltip, IconButton } from '@material-ui/core';
import { FileCopy } from '@material-ui/icons';
import { clipboard } from 'electron';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
`;

const MnemonicInfo = styled.div`

`;

const MnemonicDisplay = styled.div`
  border: 1px solid Gold;
  border-radius: 10px;
  padding: 25px;
  margin-top: 15px;
  display: flex;
`;

const MnemonicText = styled.div`
  flex-grow: 1;
`;

type ShowMnemonicProps = {
  step: number,
  mnemonic: string,
}

const ShowMnemonic = (props: ShowMnemonicProps) => {

  const copyMnemonic = () => {
    clipboard.writeText(props.mnemonic);
  }

  if (props.step == 1) {
    return (
      <Container>
        <MnemonicInfo>
          Below is your mnemonic.  Make sure you back it up - without it you will not be able to retrieve your funds.
        </MnemonicInfo>
        <MnemonicDisplay>
          <MnemonicText>
            {props.mnemonic}
          </MnemonicText>
          <Tooltip title="Copy">
            <IconButton aria-label="copy" color="primary" onClick={copyMnemonic}>
              <FileCopy />
            </IconButton>
          </Tooltip>
        </MnemonicDisplay>
      </Container>
    );
  }

  return (null);
}

export default ShowMnemonic;