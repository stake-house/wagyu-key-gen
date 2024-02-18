import React, { FC, ReactElement } from "react";
import { Grid, Button } from "@mui/material";

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

/**
 * This contains the navigation components (back, next) that the user uses to navigate through the process
 * 
 * @param props.onPrev the function to execute when the user hits previous
 * @param props.onNext the function to execute when the user hits next
 * @param props.disableBack whether or not to disable the back button
 * @param props.disableNext whether or not to disable the next button
 * @param props.hideBack whether or not to hide the back button
 * @param props.hideNext whether or not to hide the next button
 * @param props.backLabel the label for the back button
 * @param props.nextLabel the label for the next button
 * @returns react component to render
 */
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
        {!props.hideNext  && (
          <Button variant="contained" color="primary" disabled={props.disableNext} onClick={props.onNext} tabIndex={2}>{props.nextLabel}</Button>
        )}
      </Grid>
      <Grid item xs={2} />
    </Grid>
  )
}

export default StepNavigation;