import { Button, Typography } from "@mui/material";
import { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { useState } from "react";
import { errors } from "../constants";

interface FolderSelectorParams {
  onFolderSelect: (folder: string) => void;
}

const FolderSelector = ({ onFolderSelect }: FolderSelectorParams) => {
  const [displayFolderPicker, setDisplayFolderPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const verifyFolder = (folderPath: string) => {
    window.bashUtils.doesDirectoryExist(folderPath)
      .then((exists) => {
        if (!exists) {
          setErrorMessage(errors.FOLDER_DOES_NOT_EXISTS);
        } else {

          window.bashUtils.isDirectoryWritable(folderPath)
            .then((writable) => {
              if (!writable) {
                setErrorMessage(errors.FOLDER_IS_NOT_WRITABLE);
              } else {
                onFolderSelect(folderPath);
              }
            });
        }
      });
  };

  const chooseFolder = () => {
    const options: OpenDialogOptions = {
      properties: ['openDirectory']
    };

    setErrorMessage("");
    setDisplayFolderPicker(true);

    window.electronAPI.invokeShowOpenDialog(options)
      .then((value: OpenDialogReturnValue) => {
        if (value !== undefined && value.filePaths.length > 0) {
          verifyFolder(value.filePaths[0]);
        }
      })
      .finally(() => {
        setDisplayFolderPicker(false);
      });
  };

  return (
    <div className="tw-flex tw-flex-col tw-gap-2">
      <div className="tw-text-center">
        <Button
          color="secondary"
          component="label"
          disabled={displayFolderPicker}
          onClick={chooseFolder}
          tabIndex={1}
          variant="contained"
        >
          Browse
        </Button>
      </div>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
    </div>
  );
};

export default FolderSelector;
