import { HashRouter, Route, Switch } from "react-router-dom";

import Home from "./pages/Home";
import React from "react";
import styled from "styled-components";
import MnemonicGenerationWizard from "./pages/MnemonicGenerationWizard";
import MnemonicImport from "./pages/MnemonicImport";
import KeyGenerationWizard from "./pages/KeyGenerationWizard";
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
            <Route exact path="/mnemonicgeneration" component={MnemonicGenerationWizard} />
            <Route exact path="/mnemonicimport" component={MnemonicImport} />
            <Route exact path="/keygeneration" component={KeyGenerationWizard} />
          </Switch>
        </Container>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
