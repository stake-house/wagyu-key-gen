import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';

const Container = styled.div`
`;

type KeysCreatedProps = {
  folderPath: string,
}

const KeysCreated: FC<KeysCreatedProps> = (props): ReactElement => {
  return (
    <Container>
      Your keys have been created.  They can be found in the directory '{props.folderPath}'
    </Container>
  );
}

export default KeysCreated;