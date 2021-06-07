import { TextField } from '@material-ui/core';
import React, { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

type VerifyKeysPasswordProps = {
  step: number,
  setVerifyPassword: Dispatch<SetStateAction<string>>,
  error: string,
}

const VerifyKeysPassword = (props: VerifyKeysPasswordProps) => {

  const updateVerifyPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setVerifyPassword(e.target.value);
  }
  if (props.step == 1) {
    return (
      <Container>
        <TextField id="password" label="Retype Password" type="password" variant="outlined" onChange={updateVerifyPassword} />
        { props.error ? props.error : null }
      </Container>
    );
  }

  return (null);
}

export default VerifyKeysPassword;