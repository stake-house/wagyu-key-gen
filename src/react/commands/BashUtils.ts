// BashUtils.ts
/**
 * This BashUtils module provides different file and OS utility functions. Those fonctions should
 * work across all our supported operating systems including Linux, macOS and Windows.
 * 
 * @module
 */

import { accessSync, constants, statSync } from "fs";
import { fileSync } from "tmp";

/**
 * Check for the existence of a file or a directory on the filesystem.
 * 
 * @param filename The path to the file or directory.
 * 
 * @returns Returns true if the file or directory exists. Returns false if not.
 */
const doesFileExist = (filename: string): boolean => {
  try {
    accessSync(filename, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Check for the existence of a directory on the filesystem.
 * 
 * @param directory The path to the directory.
 * 
 * @returns Returns true if the directory exists. Returns false if not.
 */
const doesDirectoryExist = (directory: string): boolean => {
  if (doesFileExist(directory)) {
    return statSync(directory).isDirectory();
  }
  return false;
}

/**
 * Check if we can write a file in a directory.
 * 
 * @param directory The path to the directory.
 * 
 * @returns Returns true if the directory is writable and if a file can be written in the
 *          directory. Returns false if not.
 */
const isDirectoryWritable = (directory: string): boolean => {
  let tempFile = null;
  try {
    accessSync(directory, constants.W_OK);

    /**
    * On Windows, checking for W_OK on a directory is not enough to tell if we can write a file in
    * it. We need to actually write a temporary file to check.
    */
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