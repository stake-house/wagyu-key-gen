import { Button } from "@mui/material";
import WizardWrapper from "../components/WizardWrapper";
import { BTECFlow, BTECImportPath } from "../constants";
import { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { BTECContext } from "../BTECContext";

const ConfigureWithdrawalAddress = () => {
  const { mnemonic } = useContext(BTECContext);
  const history = useHistory();

  useEffect(() => {
    if (!mnemonic) {
      history.replace(BTECImportPath);
    }
  }, []);
  const onBackClick = () => {

  };

  const onNextClick = () => {

  };

  return (
    <WizardWrapper
      actionBarItems={[
        <Button variant="contained" color="primary" onClick={() => onBackClick()} tabIndex={3}>Back</Button>,
        <Button variant="contained" color="primary" onClick={() => onNextClick()} tabIndex={2}>Next</Button>,
      ]}
      activeTimelineIndex={0}
      timelineItems={BTECFlow}
      title="Generate BLS to execution change"
    >
      <div>{mnemonic}</div>
    </WizardWrapper>
  )
};

export default ConfigureWithdrawalAddress;

