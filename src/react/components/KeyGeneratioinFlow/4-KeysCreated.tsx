import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
`;

type KeysCreatedProps = {
  step: number,
  folderPath: string,
}

const KeysCreated = (props: KeysCreatedProps) => {

  if (props.step == 4) {
    return (
      <Container>
        Your keys have been created.  They can be found in the directory '{props.folderPath}'
      </Container>
    );
  }

  return (null);
}

export default KeysCreated;