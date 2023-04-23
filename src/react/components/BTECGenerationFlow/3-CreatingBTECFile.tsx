import { Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import LoadingComponent from '../LoadingComponent';

type CreatingBTECFileProps = {
}

const WaitingMessage = styled(Typography)`
  width: 100%;
`;

/**
 * The waiting screen while the BTEC file is being created.
 *
 * @returns react element to render
 */
const CreatingBTECFile: FC<CreatingBTECFileProps> = (): ReactElement => {
  return (
    <LoadingComponent>
      <WaitingMessage variant="body1" align="center">
        Creating your BLS to execution change file.
      </WaitingMessage>
    </LoadingComponent>
  );
}

export default CreatingBTECFile;