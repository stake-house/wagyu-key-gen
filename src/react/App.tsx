import { CssBaseline, ThemeProvider, StyledEngineProvider } from "@mui/material";
import { FC, ReactElement } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { OnlineDetector } from "./components/OnlineDetector";
import VersionFooter from "./components/VersionFooter";
import GlobalContextWrapper from "./GlobalContext";
import CreateMnemonic from "./pages/CreateMnemonic";
import Home from "./pages/Home";
import theme from "./theme";
import ConfigureValidatorKeys from "./pages/ConfigureValidatorKeys";
import MnemonicImport from "./pages/MnemonicImport";
import ConfigureWithdrawalAddress from "./pages/ConfigureWithdrawalAddress";
import { BTECImportPath, ConfigureBTECPath, ConfigureCreatePath, ConfigureExistingPath, CreateKeysCreatePath, CreateKeysExistingPath, CreatePath, ExistingImportPath, FinishCreatePath, FinishExistingPath } from "./constants";
import CreateValidatorKeys from "./pages/CreateValidatorKeys";
import KeyCreationContextWrapper from "./KeyCreationContext";
import BTECContextWrapper from "./BTECContext";
import FinishKeyGeneration from "./pages/FinishKeyGeneration";

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

                <Route>

                  {/* Create Mnemonic & Keys Flow */}
                  <KeyCreationContextWrapper>
                    <Switch>
                      <Route path={CreatePath} children={() => <CreateMnemonic />} />
                      <Route path={ConfigureCreatePath} children={() => <ConfigureValidatorKeys />} />
                      <Route path={CreateKeysCreatePath} children={() => <CreateValidatorKeys />} />
                      <Route path={FinishCreatePath} children={() => <FinishKeyGeneration />} />
                    </Switch>
                  </KeyCreationContextWrapper>


                  {/* Import Mnemonic & Generate Keys Flow */}
                  <KeyCreationContextWrapper>
                    <Switch>
                      <Route path={ExistingImportPath} render={() => <MnemonicImport />} />
                      <Route path={ConfigureExistingPath} render={() => <ConfigureValidatorKeys />} />
                      <Route path={CreateKeysExistingPath} render={() => <CreateValidatorKeys />} />
                      <Route path={FinishExistingPath} render={() => <FinishKeyGeneration />} />
                    </Switch>
                  </KeyCreationContextWrapper>


                  {/* Update Withdrawal Credentials Flow */}
                  <BTECContextWrapper>
                    <Switch>
                      <Route path={BTECImportPath} render={() => <MnemonicImport />} />
                      <Route path={ConfigureBTECPath} render={() => <ConfigureWithdrawalAddress />} />
                    </Switch>
                  </BTECContextWrapper>
                </Route>
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
