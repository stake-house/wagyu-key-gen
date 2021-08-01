import React, { FC, ReactElement } from "react";
import { Grid, Button } from "@material-ui/core";

type Props = {
  onPrev: () => void,
  onNext: () => void,
  disableBack?: boolean,
  disableNext?: boolean,
  hideBack?: boolean,
  hideNext?: boolean,
  backLabel?: string,
  nextLabel?: string,
}

const StepNavigation: FC<Props> = (props): ReactElement => {
  return (
    <Grid item container>
      <Grid item xs={2} text-align="center">
        {!props.hideBack && (
          <Button variant="contained" color="primary" disabled={props.disableBack} onClick={props.onPrev}>{props.backLabel}</Button>
        )}
      </Grid>
      <Grid item xs={8} />
      <Grid item xs={2} text-align="center">
        {!props.hideNext && (
          <Button variant="contained" color="primary" disabled={props.disableNext} onClick={props.onNext}>{props.nextLabel}</Button>
        )}
      </Grid>
    </Grid>
  )
}

export default StepNavigation;