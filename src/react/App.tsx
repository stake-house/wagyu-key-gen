import { CssBaseline, ThemeProvider, Theme, StyledEngineProvider } from "@mui/material";
import { FC, ReactElement } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import Home from "./pages/Home";
import theme from "./theme";
import VersionFooter from "./components/VersionFooter";
import GlobalContextWrapper from "./globalContext";

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
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HashRouter>
          <GlobalContextWrapper>
            <Container>
              <Switch>
                <Route exact path="/" render={() => <Home />} />
              </Switch>
              <VersionFooter />
            </Container>
          </GlobalContextWrapper>
        </HashRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
