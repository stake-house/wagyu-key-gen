import React, { useState } from 'react';
import { Route, Switch, useRouteMatch, RouteComponentProps } from "react-router-dom";
import MnemonicGenerationWizard from "./MnemonicGenerationWizard";
import MnemonicImport from "./MnemonicImport";
import KeyGenerationWizard from "./KeyGenerationWizard";

type IncomingState = {
  network: string,
}

type Props = RouteComponentProps<{}, any, IncomingState>;

function Wizard (props: Props) {
  let { path } = useRouteMatch();
  const [mnemonic, setMnemonic] = useState("");
  const { network } = props.location.state;

  return (
    <Switch>
      <Route
        exact
        path={`${path}/mnemonicgeneration`}
        render={routeProps => <MnemonicGenerationWizard {...{ ...routeProps, network, mnemonic, setMnemonic }} />} 
      />
      <Route
        exact
        path={`${path}/mnemonicimport`}
        render={routeProps => <MnemonicImport {...{ ...routeProps, network, mnemonic, setMnemonic }} />}
      />
      <Route
        exact
        path={`${path}/keygeneration`}
        render={routeProps => <KeyGenerationWizard {...{ ...routeProps, network, mnemonic }} />}
      />
    </Switch>
  );
}

export default Wizard;