import { Background, Yellow } from "./colors";
import { HashRouter, Route, Switch } from "react-router-dom";

import { GlobalStyles } from "../globalStyles";
import Home from "./pages/Home";
import React from "react";
import styled from "styled-components";
import MnemonicGenerationWizard from "./pages/MnemonicGenerationWizard";
import MnemonicImport from "./pages/MnemonicImport";
import KeyGenerationWizard from "./pages/KeyGenerationWizard";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${Background};
`;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: Yellow,
    }
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <GlobalStyles />
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
