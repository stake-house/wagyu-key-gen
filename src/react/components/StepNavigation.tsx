import React, { FC, ReactElement } from "react";
import { Grid, Button } from "@material-ui/core";
import styled from 'styled-components';

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
    <Grid item container justifyContent="space-between">
      <Grid item xs={2} />
      <Grid item xs={2}>
        {!props.hideBack && (
          <Button variant="contained" color="primary" disabled={props.disableBack} onClick={props.onPrev} tabIndex={3}>{props.backLabel}</Button>
        )}
      </Grid>
      <Grid item xs={4} />
      <Grid item xs={2}>
        {!props.hideNext && (
          <Button variant="contained" color="primary" disabled={props.disableNext} onClick={props.onNext} tabIndex={2}>{props.nextLabel}</Button>
        )}
      </Grid>
      <Grid item xs={2} />
    </Grid>
  )
}

export default StepNavigation;