import { accessSync, constants, statSync } from "fs";
import { fileSync } from "tmp";

const doesFileExist = (filename: string): boolean => {
  try {
    accessSync(filename, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};

const doesDirectoryExist = (directory: string): boolean => {
  if (doesFileExist(directory)) {
    return statSync(directory).isDirectory();
  }
  return false;
}

const isDirectoryWritable = (directory: string): boolean => {
  let tempFile = null;
  try {
    accessSync(directory, constants.W_OK);

    tempFile = fileSync({ keep: false, tmpdir: directory });

    return true;
  } catch (err) {
    return false;
  } finally {
    if (tempFile != null) {
      tempFile.removeCallback();
    }
  }
}

export {
  doesFileExist,
  doesDirectoryExist,
  isDirectoryWritable
};