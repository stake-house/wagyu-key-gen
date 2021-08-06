import { HashRouter, Route, Switch } from "react-router-dom";
import React, { FC, ReactElement, useState } from "react";
import styled from "styled-components";
import Home from "./pages/Home";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import 'typeface-roboto';
import MainWizard from "./pages/MainWizard";
import theme from "./theme";
import { Network } from './types';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const App: FC = (): ReactElement => {
  const [network, setNetwork] = useState<Network>(Network.PRATER);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Container>
          <Switch>
            <Route exact path="/" render={() => <Home network={network} setNetwork={setNetwork} />} />
            <Route exact path="/wizard/:stepSequenceKey" render={() => <MainWizard network={network} />} />
          </Switch>
        </Container>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
