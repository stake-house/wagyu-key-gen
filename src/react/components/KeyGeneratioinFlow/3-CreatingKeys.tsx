import { CircularProgress, Grid, Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';

type CreatingKeysProps = {
}

const CreatingKeys: FC<CreatingKeysProps> = (props): ReactElement => {
  return (
    <Grid container direction="column" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="body1">
          Creating keys....
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <CircularProgress color="secondary" />
      </Grid>
    </Grid>
  );
}

export default CreatingKeys;