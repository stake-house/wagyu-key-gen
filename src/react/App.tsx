import { Background, White } from "./colors";
import { HashRouter, Route, Switch } from "react-router-dom";

import { GlobalStyles } from "../globalStyles";
import Home from "./pages/Home";
import Mnemonic from "./pages/Mnemonic";
import React from "react";
import styled from "styled-components";

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${Background};
`;

const App = () => {
  return (
    <HashRouter>
      <GlobalStyles />
      <Container>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/mnemonic" component={Mnemonic} />
        </Switch>
      </Container>
    </HashRouter>
  );
};

export default App;
