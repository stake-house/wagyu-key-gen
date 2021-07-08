import { Button, Grid, Typography } from '@material-ui/core';
import { SettingsEthernetSharp } from '@material-ui/icons';
import { remote, OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { uname } from '../../commands/BashUtils';
import { generateKeys } from '../../commands/Eth2Deposit';
import { errors } from '../../constants';

type CreatingKeysProps = {
  step: number,
  mnemonic: string,
  index: number,
  numberOfKeys: number,
  network: string,
  password: string,
  folderPath: string,
}

const CreatingKeys = (props: CreatingKeysProps) => {
  if (props.step == 3) {
    return (
      <Grid container direction="column" spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body1">
            Creating keys....
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (null);
}

export default CreatingKeys;