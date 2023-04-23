import { BackgroundLight, } from '../colors';
import { Button, Grid, Tooltip } from '@material-ui/core';
import React from 'react';

import { ReuseMnemonicAction } from '../types';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 380px;
  width: 560px;
  background: rgba(27, 38, 44, 0.95);
  border-radius: 20px;
  align-items: center;
  background: ${BackgroundLight};
  margin: auto;
  margin-top: 150px;
`;

const Header = styled.div`
  font-size: 26px;
  margin-top: 30px;
  margin-bottom: 30px;
  margin-left: 20px;
  margin-right: 20px;
`;

const OptionsGrid = styled(Grid)`
  margin-top: 15px;
  align-items: center;
`;

type ReuseMnemonicActionPickerProps = {
  handleCloseReuseMnemonicModal: (event: object, reason: string) => void,
  handleReuseMnemonicModalSubmitClick: (action: ReuseMnemonicAction) => void,
}

/**
 * This is the reuse mnemonic action picker modal component where the user selects which action they want
 * to perform after reusing their mnemonic.
 * 
 * @param props.handleCloseReuseMnemonicModal function to handle closing the reuse mnemonic action modal
 * @param props.setReuseMnemonicAction update the selected reuse mnemonic action
 * @param props.reuseMnemonicAction the selected reuse mnemonic action
 * @returns the reuse mnemonic action picker element to render
 */
export const ReuseMnemonicActionPicker = (props: ReuseMnemonicActionPickerProps) => {

  const handleSelectedAction = (action: ReuseMnemonicAction) => {
    
    props.handleReuseMnemonicModalSubmitClick(action);
    props.handleCloseReuseMnemonicModal({}, 'submitClick');

  }

  return (
    <Container>
      <Header>How would you like to use your existing secret recovery phrase?</Header>
      <div>
        <OptionsGrid container spacing={2} direction="column">
          <Grid item>
            <Button variant="contained" color="primary" onClick={() => handleSelectedAction(ReuseMnemonicAction.RegenerateKeys)}>
              Regenerate your validator keys
            </Button>
          </Grid>
          <Grid item>
            <Tooltip title="If you initially created your validator keys without adding a withdrawal address, you can generate this BLS to execution change to add one once.">
              <Button variant="contained" color="primary" onClick={() => handleSelectedAction(ReuseMnemonicAction.GenerateBLSToExecutionChange)}>
                Generate your BLS to execution change<br />(Add a withdrawal address)
              </Button>
            </Tooltip>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={() => handleSelectedAction(ReuseMnemonicAction.GeneratePreSignExitTransaction)}>
              Generate a pre-signed exit transaction
            </Button>
          </Grid>
        </OptionsGrid>
      </div>
    </Container>
  )
}