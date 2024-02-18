import { Box, Grid, Typography, Link } from '@mui/material';
import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import { Network } from '../../types';

type BTECFileCreatedProps = {
  folderPath: string,
  network: Network
}

const LoudText = styled(Typography)`
  color: cyan;
  text-align: left;
`;

const QuietText = styled(Typography)`
  color: gray;
  text-align: left;
`;

/**
 * The final page displaying BTEC file location and information it.
 * 
 * @param props self documenting paramenters passed in
 * @returns the react element to render
 */
const BTECFileCreated: FC<BTECFileCreatedProps> = (props): ReactElement => {

  const openKeyLocation = () => {
    window.bashUtils.findFirstFile(props.folderPath, "bls_to_execution_change")
      .then((keystoreFile) => {
        let fileToLocate = props.folderPath;
        if (keystoreFile != "") {
          fileToLocate = keystoreFile;
        }
        window.electronAPI.shellShowItemInFolder(fileToLocate);
    });
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={1} />
      <Grid item xs={10}>
          <Box sx={{ m: 2 }}>
            <Typography variant="body1" align="left">
              Your BLS to execution change file has been created here: <Link
              display="inline"
              component="button"
              onClick={openKeyLocation}
              underline="hover">{props.folderPath}</Link>
            </Typography>
          </Box>
      </Grid>
      <Grid item xs={1} />
      <Grid item xs={1} />
      <Grid item xs={10}>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left">
            There is a single file for this:
          </Typography>
          <LoudText>BLS to execution file (ex. bls_to_execution_change-xxxxxxx.json)</LoudText>
          <Typography variant="body2" align="left">
            This file contains your signature to add your withdrawal address on your validator(s). You can easily publish it on beaconcha.in website by using their <em>Broadcast Signed Messages</em> tool.
          </Typography>
          <QuietText>
            Note: Your clipboard will be cleared upon closing this application.
          </QuietText>
        </Box>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

export default BTECFileCreated;