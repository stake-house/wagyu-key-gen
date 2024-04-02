import { ReactNode, useContext } from "react";
import { Step, StepLabel, Stepper, Typography } from "@mui/material";

import { stepLabels } from "../constants";
import { GlobalContext } from "../GlobalContext";
import { StepKey } from "../types";

interface WizardWrapperParams {
  actionBarItems: ReactNode[];
  activeTimelineIndex: number;
  children: ReactNode;
  timelineItems: StepKey[];
  title: string;
}

/**
 * Wrapper of a page to display the network, title, stepper, and action bar buttons.
 *
 * @param actionBarItems A list of buttons to display
 * @param activeTimelineIndex The index of the timelineItems array that is active
 * @param children The inner content of the page
 * @param timelineItems A list of steps to display
 * @param title The title to appear at the top of the page
 */
const WizardWrapper = ({
  actionBarItems,
  activeTimelineIndex,
  children,
  timelineItems,
  title,
}: WizardWrapperParams) => {
  const { network } = useContext(GlobalContext);

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-h-full">
      <div className="tw-mt-2 tw-mb-8 tw-text-right">
        <Typography variant="caption" className="tw-text-gray tw-mr-6">
          Network: {network}
        </Typography>
      </div>

      <div className="tw-px-28 tw-mb-8">
        <Typography className="tw-text-center" variant="h1">
          {title}
        </Typography>
      </div>

      {children}

      <div className="tw-grow" />

      <Stepper
        activeStep={activeTimelineIndex}
        alternativeLabel
        className="tw-bg-transparent tw-mb-14"
      >
        {timelineItems.map((step: StepKey, index: number) => (
          <Step key={index}>
            <StepLabel>{stepLabels[step]}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className="tw-flex tw-flex-row tw-justify-around tw-mb-20 tw-h-[37px]">
        {actionBarItems.map((item: ReactNode, index: number) => (
          <div className="tw-text-center tw-min-w-[150px]" key={index}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WizardWrapper;
