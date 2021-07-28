import { HashRouter, Route, Switch } from "react-router-dom";

import Home from "./pages/Home";
import React from "react";
import styled from "styled-components";
import Wizard from "./pages/Wizard";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import theme from "./theme";
import 'typeface-roboto';


const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Container>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/wizard" component={Wizard} />
          </Switch>
        </Container>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
