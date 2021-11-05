import { Grid, Typography } from "@material-ui/core";
import React from "react";
import styled from "styled-components";

declare var VERSION: string;
declare var COMMITHASH: string;

const SoftText = styled(Typography)`
  color: gray;
  text-align: center;
  font-size: 10px;
`;

const Container = styled.div`
  position: fixed;
  bottom: 35;
  width: 100%;
`;

const VersionFooter = () => {
  return(
    <Container>
      <Grid container direction="column">
        <Grid item justifyContent="center" xs={12}>
          <SoftText>Version: {VERSION} - Commit Hash: {COMMITHASH}</SoftText>
        </Grid>
      </Grid>
    </Container>
  )
}

export default VersionFooter;