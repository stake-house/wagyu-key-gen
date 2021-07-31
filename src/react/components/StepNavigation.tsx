import React, { FC, ReactElement } from "react";
import { Grid, Button } from "@material-ui/core";

type Props = {
  onStepBack: () => void,
  onStepForward: () => void,
  disableBack?: boolean,
  disableForward?: boolean,
  hideBack?: boolean,
  hideForward?: boolean,
  backLabel?: string,
  forwardLabel?: string,
}

const StepNavigation: FC<Props> = (props): ReactElement => {
  return (
    <Grid item container>
      <Grid item xs={2} text-align="center">
        {!props.hideBack && (
          <Button variant="contained" color="primary" disabled={props.disableBack} onClick={props.onStepBack}>{props.backLabel}</Button>
        )}
      </Grid>
      <Grid item xs={8} />
      <Grid item xs={2} text-align="center">
        {!props.hideForward && (
          <Button variant="contained" color="primary" disabled={props.disableForward} onClick={props.onStepForward}>{props.forwardLabel}</Button>
        )}
      </Grid>
    </Grid>
  )
}

export default StepNavigation;