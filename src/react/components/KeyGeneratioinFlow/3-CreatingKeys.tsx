import { Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import LoadingComponent from '../LoadingComponent';

type CreatingKeysProps = {
}

/**
 * The waiting screen while keys are being created.
 * 
 * @returns react element to render
 */
const CreatingKeys: FC<CreatingKeysProps> = (): ReactElement => {
  return (
    <LoadingComponent>
      <Typography variant="body1" align="left">
        The duration of this process depends on how many keys you are generating and the performance of your computer.  Generating one key takes about 30 seconds.  Generating 100 keys may take about 10 minutes.
      </Typography>
    </LoadingComponent>
  );
}

export default CreatingKeys;
