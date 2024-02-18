import { CssBaseline, ThemeProvider, Theme, StyledEngineProvider } from "@mui/material";
import React, { FC, ReactElement, useState } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import 'typeface-roboto';
import { OnlineDetector } from "./components/OnlineDetector";
import Home from "./pages/Home";
import MainWizard from "./pages/MainWizard";
import theme from "./theme";
import { Network } from './types';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


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
    <StyledEngineProvider injectFirst>
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
    </StyledEngineProvider>
  );
};

export default App;
