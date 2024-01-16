import { CssBaseline, ThemeProvider } from "@material-ui/core";
import React, { FC, ReactElement, useState } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import 'typeface-roboto';
import { OnlineDetector } from "./components/OnlineDetector";
import Home from "./pages/Home";
import MainWizard from "./pages/MainWizard";
import theme from "./theme";
import { Network } from './types';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

/**
 * The React app top level including theme and routing.
 *
 * @returns the react element containing the app
 */
const App: FC = (): ReactElement => {
  const [network, setNetwork] = useState<Network>(Network.MAINNET);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Container>
          <OnlineDetector />
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
