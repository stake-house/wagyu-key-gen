import { CssBaseline, ThemeProvider, StyledEngineProvider } from "@mui/material";
import { FC, ReactElement } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import Home from "./pages/Home";
import theme from "./theme";
import VersionFooter from "./components/VersionFooter";
import GlobalContextWrapper from "./globalContext";
import { OnlineDetector } from "./components/OnlineDetector";

/**
 * The React app top level including theme and routing.
 *
 * @returns the react element containing the app
 */
const App: FC = (): ReactElement => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HashRouter>
          <GlobalContextWrapper>
            <main className="tw-flex tw-flex-col tw-h-[100vh]">
              <OnlineDetector />
              <Switch>
                <Route exact path="/" render={() => <Home />} />
              </Switch>
              <VersionFooter />
            </main>
          </GlobalContextWrapper>
        </HashRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
