import { Typography } from "@mui/material";
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

/**
 * This component is a footer used to display the version and commit hash.
 *
 * @returns the footer component containing the version and commit hash
 */
const VersionFooter = () => {
  return(
    <Container>
      <SoftText>Version: {VERSION} - Commit Hash: {COMMITHASH}</SoftText>
    </Container>
  )
}

export default VersionFooter;