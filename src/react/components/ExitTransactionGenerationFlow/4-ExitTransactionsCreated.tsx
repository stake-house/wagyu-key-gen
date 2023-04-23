import { Box, Grid, Typography, Link } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';

type ExitTransactionsCreatedProps = {
  folderPath: string,
}

const SubHeader = styled(Typography)`
  text-align: center;
  width: 100%;
`;

const LoudText = styled(Typography)`
  color: cyan;
  text-align: left;
`;

const QuietText = styled(Typography)`
  color: gray;
  text-align: left;
`;

/**
 * The final page displaying exit transaction file locations
 *
 * @param props self documenting paramenters passed in
 * @returns the react element to render
 */
const ExitTransactionsCreated: FC<ExitTransactionsCreatedProps> = (props): ReactElement => {

  const openKeyLocation = () => {
    window.bashUtils.findFirstFile(props.folderPath, "signed_exit_transactions")
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
          <SubHeader variant="body1">
            Your exit transaction file has been created here: <Link display="inline" component="button" onClick={openKeyLocation}>{props.folderPath}</Link>
          </SubHeader>
        </Box>
      </Grid>
      <Grid item xs={1} />
      <Grid item xs={1} />
      <Grid item xs={10}>
        <Box sx={{ m: 2 }}>
          <Typography variant="body1" align="left">
            There is a single file for this:
          </Typography>
          <LoudText>Signed exit transaction file (ex. signed_exit_transactions-xxxxxxx.json)</LoudText>
          <Typography variant="body2" align="left">
            This file contains your signature to exit your validator(s). You can easily publish it on beaconcha.in website by using their <em>Broadcast Signed Messages</em> tool.
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

export default ExitTransactionsCreated;