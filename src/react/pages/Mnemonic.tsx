import {
  Black,
  ButtonColor,
  ButtonHover,
  Gray4,
  Heading,
  MainContent
} from '../colors';

import FileCopyIcon from '@material-ui/icons/FileCopy';

import Footer from '../components/Footer';
import React, { useState } from 'react';

import { createMnemonic, generateKeys } from "../commands/Eth2Deposit";

import styled from 'styled-components';
import { IconButton, Button, Tooltip } from '@material-ui/core';
import { clipboard } from 'electron';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const LandingHeader = styled.div`
  font-weight: 700;
  font-size: 35;
  margin-top: 50;
  color: ${Heading};
  max-width: 550;
`;

const Network = styled.div`
  color: ${Gray4};
  margin-top: 35px;
  margin-right: 35px;
  align-self: flex-end;
`;

const PreMnemonicContent = styled.div`
  display: flex;
  flex-direction: column;
  color: ${MainContent};
  margin-top: 20;
  width: 650;`
;

const MnemonicContent = styled.div`
  display: flex;
  flex-direction: column;
  color: ${MainContent};
  margin-top: 20;
  width: 650;
`;

const CreateOrImport = styled.div`
  display: flex;
  margin-top: 50px;
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

const ImportInputs = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

type MnemonicProps = {
  network: string
}

const Mnemonic = (props: MnemonicProps) => {
  const [inputMnemonic, setInputMnemonic] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicVerified, setMnemonicVerified] = useState(false);

  const updateInputMnemonic = (e: React.FormEvent<HTMLInputElement>) => {
    setInputMnemonic(e.currentTarget.value);
  }

  const importMnemonic = () => {
    // TODO: validate mnemonic?
    setMnemonic(inputMnemonic);
  }

  const clearMnemonic = () => {
    setMnemonic("");
    setInputMnemonic("");
  }

  const copyMnemonic = () => {
    clipboard.writeText(mnemonic);
  }

  const uiCreateMnemonic = () => {
    setMnemonic(createMnemonic('english'));
  }

  const uiGenerateKeys = () => {
    generateKeys(mnemonic, 0, 1, "mainnet", "secret", "");
  }
  
  return (
    <Container>
      <Network>banana</Network>
      <LandingHeader>Manage Your Keys</LandingHeader>
      { mnemonic == "" &&
        <PreMnemonicContent>
          We need a mnemonic in order to create keys.  Create a new one or import yours below.
          <CreateOrImport>
            <div>
              <Button variant="contained" onClick={uiCreateMnemonic}>Create Mnemonic</Button>
            </div>
            <ImportInputs>
              <input type="text" value={inputMnemonic} onChange={updateInputMnemonic}/>
              <Button variant="contained" onClick={importMnemonic}>Import Mnemonic</Button>
            </ImportInputs>
          </CreateOrImport>
        </PreMnemonicContent>
      }
      { mnemonic != "" && 
        <MnemonicContent>
          Below is your mnemonic.  Make sure you back it up - without it you will not be able to retrieve your funds.
          <MnemonicDisplay>
            <MnemonicText>
              {mnemonic}
            </MnemonicText>
            <Tooltip title="Copy">
              <IconButton aria-label="copy" color="primary" onClick={copyMnemonic}>
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
          </MnemonicDisplay>
          <Button variant="contained" onClick={uiGenerateKeys}>Generate Keys</Button>
          <Button variant="contained" onClick={clearMnemonic}>Clear Mnemonic</Button>
        </MnemonicContent>
      }
      { mnemonic != "" && 
        <MnemonicContent>
          Below is your mnemonic.  Make sure you back it up - without it you will not be able to retrieve your funds.
          <MnemonicDisplay>
            <MnemonicText>
              {mnemonic}
            </MnemonicText>
            <Tooltip title="Copy">
              <IconButton aria-label="copy" color="primary" onClick={copyMnemonic}>
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
          </MnemonicDisplay>
          <Button variant="contained" onClick={uiGenerateKeys}>Generate Keys</Button>
          <Button variant="contained" onClick={clearMnemonic}>Clear Mnemonic</Button>
        </MnemonicContent>
      }
      <Footer backLink={"/"} backLabel={"Home"} nextLink={""} nextLabel={""} />
    </Container>
  );
}
export default Mnemonic;