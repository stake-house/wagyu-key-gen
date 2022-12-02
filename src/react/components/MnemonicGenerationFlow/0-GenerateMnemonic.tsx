import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import { Box, Grid, Link, Typography } from '@material-ui/core';
import { Warning } from '../../colors';
import styled from 'styled-components';

type GenerateMnemonicProps = {
  setGenerateError: Dispatch<SetStateAction<boolean>>,
  generateError: boolean,
  setGenerateErrorMsg: Dispatch<SetStateAction<string>>,
  generateErrorMsg: string,
}

const LoudText = styled.span`
  color: ${Warning};
`;

const LinksTag = styled.a`
  color: #a3aada;
`;

const GridBox = styled(Grid)`
  background-color: #efe3d9;
  border-radius: 20px;
  padding: 10px 20px;
  margin-bottom: 20px;
`;


/**
 * This page initiates the mnemonic generation flow.  It displays info and creates the mnemonic.
 * 
 * @param props the data and functions passed in, they are self documenting
 * @returns 
 */
const GenerateMnemonic: FC<GenerateMnemonicProps> = (props): ReactElement => {
  return (
    <Grid container>
      <Grid item xs={1} />
      <GridBox item xs={10}>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left">
            In this step, we'll generate a Secret Recovery Phrase (traditionally referred to as a "mnemonic") and a set of validator keys for you. For more information, visit:  <LinksTag href="https://kb.beaconcha.in/ethereum-2-keys" target="_blank">kb.beaconcha.in/ethereum-2-keys</LinksTag>
          </Typography>
        </Box>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left" gutterBottom>
            It is <LoudText>very</LoudText> important to <LoudText>keep both your secret recovery phrase and your validator keys safe and secure</LoudText> as you will need them to retrieve your funds later. Anybody with access to these will also be able to steal your funds! For tips on storage, see: <LinksTag href="https://www.ledger.com/blog/how-to-protect-your-seed-phrase" target="_blank">ledger.com/blog/how-to-protect-your-seed-phrase</LinksTag>
          </Typography>
        </Box>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left" gutterBottom>
            We recommend running Wagyu KeyGen from an offline machine. One way to do this is to move the application to a USB stick, plug it in to an offline machine, and run it from there.
          </Typography>
        </Box>
        { props.generateError &&
          <Box sx={{ m: 2 }}>
            <Typography variant="body1" align="left" gutterBottom color="error">
              {props.generateErrorMsg}
            </Typography>
          </Box>
        }
      </GridBox>
      <Grid item xs={1} />
    </Grid>
  );
}

export default GenerateMnemonic;
