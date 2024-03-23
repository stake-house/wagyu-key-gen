import { Typography } from "@mui/material";
import { useContext } from "react";
import styled from "styled-components";
import { GlobalContext } from "../globalContext";

const Container = styled.div`
  position: fixed;
  top: 35;
  text-align: right;
  width: 100%;
`;

const NetworkHeader = () => {
  const { network } = useContext(GlobalContext);

  return (
    <Container>
      <Typography variant="caption" style={{color: "gray"}}>
        Network: {network}
      </Typography>
    </Container>
  );
};

export default NetworkHeader;
