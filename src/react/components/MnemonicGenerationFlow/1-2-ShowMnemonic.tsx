import { Tooltip, IconButton, Grid, Typography, CircularProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { FileCopy } from '@material-ui/icons';
import { clipboard } from 'electron';
import React, { FC, ReactElement, Fragment, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
`;

type ShowMnemonicProps = {
  showCopyWarning: boolean,
  mnemonic: string,
}

const MnemonicDisplay = styled(Typography)`
  font-size: 1.5rem;
  color: white;
  border: 1px solid gray;
  padding: 1rem;
`

const ShowMnemonic: FC<ShowMnemonicProps> = (props): ReactElement => {
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopyTooltipClose = () => {
    setCopyTooltipOpen(false);
    setTimeout(() => setCopied(false), 200);
  };

  const handleCopyTooltipOpen = () => {
    setCopyTooltipOpen(true);
  };

  const copyMnemonic = () => {
    clipboard.writeText(props.mnemonic);
    setCopied(true);
  };

  const copyText = copied ? 'Copied' : 'Copy';

  return (
    <Grid container>
      { props.mnemonic == "" &&
        <Grid container direction="column" spacing={5}>
          <Grid item xs={12}>
            Generating your secret recovery phrase.  May take up to 15 seconds.
          </Grid>
          <Grid item container xs={12} justifyContent="center">
            <Loader />
          </Grid>
        </Grid>
      }
      { props.mnemonic != "" &&
        <Grid container direction="column" spacing={3}>
          <Grid item xs={12}>
            Below is your Secret Recovery Phrase.  Make sure you back it up - without it you will not be able to retrieve your funds.
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs={1} />
            <Grid item xs={10}>
              <MnemonicDisplay id="mnemonic-display">
                {props.mnemonic}
              </MnemonicDisplay>
            </Grid>
            <Grid item xs={1} style={{alignSelf: "center"}}>
              <Tooltip title={copyText} open={copyTooltipOpen} onClose={handleCopyTooltipClose} onOpen={handleCopyTooltipOpen}>
                <IconButton aria-label="copy" color="primary" onClick={copyMnemonic} autoFocus>
                  <FileCopy />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          { props.showCopyWarning &&
            <Grid item xs={11} style={{alignSelf: "center"}}>
              <Alert severity="warning">
                Make sure you have written down your Secret Recovery Phrase *offline*, you will be prompted for it next.
              </Alert>
            </Grid>
          }
        </Grid>
      }
    </Grid>
  );
}

export default ShowMnemonic;
