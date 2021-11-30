import React, { FC, ReactElement, Dispatch, SetStateAction } from 'react';
import { Box, Grid, Link, Typography } from '@material-ui/core';
import { shell } from "electron";
import styled from 'styled-components';

type GenerateMnemonicProps = {
  setGenerateError: Dispatch<SetStateAction<boolean>>,
  generateError: boolean,
  setGenerateErrorMsg: Dispatch<SetStateAction<string>>,
  generateErrorMsg: string,
}

const LoudText = styled.span`
  color: cyan;
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
      <Grid item xs={10}>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left">
            In this step, we'll generate a Secret Recovery Phrase (traditionally referred to as a "mnemonic") and a set of validator keys for you. For more information, visit: https://kb.beaconcha.in/ethereum-2-keys
          </Typography>
        </Box>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left" gutterBottom>
            It is <b>very</b> important to <LoudText>keep both your secret recovery phrase and your validator keys safe and secure</LoudText> as you will need them to retrieve your funds later. Anybody with access to these will also be able to steal your funds! For tips on storage, see: https://www.ledger.com/blog/how-to-protect-your-seed-phrase
          </Typography>
        </Box>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left" gutterBottom>
            We recommend running Wagyu Key Gen from an offline machine. One way to do this is to move the application to a USB stick, plug it in to an offline machine, and run it from there.
          </Typography>
        </Box>
        { props.generateError &&
          <Box sx={{ m: 2 }}>
            <Typography variant="body1" align="left" gutterBottom color="error">
              {props.generateErrorMsg}
            </Typography>
          </Box>
        }
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default GenerateMnemonic;
