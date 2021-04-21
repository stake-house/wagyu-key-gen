import { HashRouter, Route, Switch } from "react-router-dom";

import { Background } from "./colors";
import Home from "./pages/Home";
import Mnemonic from "./pages/Mnemonic";
import React from "react";
import styled from "styled-components";

const Container = styled.main`
  font-family: 'PT Mono', monospace;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${Background};
`;

const App = () => {
  return (
    <HashRouter>
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
