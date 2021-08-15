import { Tooltip, IconButton, Grid, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { FileCopy } from '@material-ui/icons';
import { clipboard } from 'electron';
import React, { FC, ReactElement, Fragment, useState } from 'react';
import styled from 'styled-components';

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
  );
}

export default ShowMnemonic;
