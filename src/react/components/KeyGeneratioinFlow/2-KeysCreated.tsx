import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
`;

type KeysCreatedProps = {
  step: number
}

const KeysCreated = (props: KeysCreatedProps) => {

  if (props.step == 2) {
    return (
      <Container>
        Your keys have been created.  They can be found in the direction 'dist/keys'
      </Container>
    );
  }

  return (null);
}

export default KeysCreated;