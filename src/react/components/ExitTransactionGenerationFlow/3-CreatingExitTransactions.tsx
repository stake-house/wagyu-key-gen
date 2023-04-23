import { Typography } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import LoadingComponent from '../LoadingComponent';

type CreatingExitTransactionsProps = {
}

const WaitingMessage = styled(Typography)`
  align-items: center;
  width: 100%;
`;

/**
 * The waiting screen while the exit transactions are created
 * 
 * @returns react element to render
 */
const CreatingExitTransactions: FC<CreatingExitTransactionsProps> = (): ReactElement => {
  return (
    <LoadingComponent>
      <WaitingMessage variant="body1">
        Creating your exit transactions
      </WaitingMessage>
    </LoadingComponent>
  );
}

export default CreatingExitTransactions;
