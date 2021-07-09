import { Button, Grid, Typography } from '@material-ui/core';
import { remote, OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import React, { Dispatch, SetStateAction } from 'react';
import { errors } from '../../constants';

type SelectFolderProps = {
  step: number,
  setFolderPath: Dispatch<SetStateAction<string>>,
  folderPath: string,
  setFolderError: Dispatch<SetStateAction<boolean>>,
  folderError: boolean,
}

const SelectFolder = (props: SelectFolderProps) => {
  const chooseFolder = () => {
    props.setFolderError(false);

    const options: OpenDialogOptions = {
      properties: ['openDirectory']
    };

    remote.dialog.showOpenDialog(options)
      .then((value: OpenDialogReturnValue) => {
        if (value !== undefined && value.filePaths.length > 0) {
          props.setFolderPath(value.filePaths[0]);
        } else {
          props.setFolderError(true);
        }
      });
  }

  if (props.step == 2) {
    return (
      <Grid container direction="column" spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body1">
            Choose a folder where we should save your keys.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" component="label" onClick={chooseFolder}>
            Browse
          </Button>
        </Grid>
        { props.folderPath != "" &&
          <Grid item xs={12}>
            <Typography >
              You've selected: {props.folderPath}
            </Typography>
          </Grid>
        }
        { props.folderError &&
          <Grid item xs={12}>
            <Typography color="error">
              {errors.FOLDER}
            </Typography>
          </Grid>
        }
      </Grid>
    );
  }

  return (null);
}

export default SelectFolder;