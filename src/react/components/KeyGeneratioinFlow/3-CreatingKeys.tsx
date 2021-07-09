import { CircularProgress, Grid, Typography } from '@material-ui/core';
import React from 'react';

type CreatingKeysProps = {
  step: number,
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
        <Grid item xs={12}>
          <CircularProgress color="secondary" />
        </Grid>
      </Grid>
    );
  }

  return (null);
}

export default CreatingKeys;