// BashUtils.ts
/**
 * This BashUtils module provides different file and OS utility functions. Those functions should
 * work across all our supported operating systems including Linux, macOS and Windows.
 * 
 * @module
 */

import { promisify } from 'util';

import { constants, readdir, readFile } from 'fs';
import { access, stat } from 'fs/promises';

import path from "path";

import { fileSync } from "tmp";
import { Keystore } from '../react/types';
import { KEYSTORE_FILE_PREFIX } from '../react/constants';

const readdirProm = promisify(readdir);
const readFileProm = promisify(readFile);

/**
 * Check for the existence of a file or a directory on the filesystem.
 * 
 * @param filename The path to the file or directory.
 * 
 * @returns Returns a Promise<boolean> that includes a true value if file or directory exists.
 */
const doesFileExist = async (filename: string): Promise<boolean> => {
  try {
    await access(filename, constants.F_OK);
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
 * @returns Returns a Promise<boolean> that includes a true value if the directory exists.
 */
const doesDirectoryExist = async (directory: string): Promise<boolean> => {
  if (await doesFileExist(directory)) {
    return (await stat(directory)).isDirectory();
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
const isDirectoryWritable = async (directory: string): Promise<boolean> => {
  let tempFile = null;
  try {
    await access(directory, constants.W_OK);

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

/**
 * Finds all files with whom filename starts with some value in a directory.
 * 
 * @param directory The path to the directory.
 * @param startsWith Filename match to look for.
 * 
 * @returns Returns a Promise<string[]> that includes the path to all files that match. 
 *          Returns empty array if none match.
 */
const findAllFiles = async (directory: string, startsWith: string): Promise<string[]> => {
  const entries = await readdirProm(directory, { withFileTypes: true });

  return entries.reduce((foundFiles: string[], entry) => {
    if (entry.isFile() && entry.name.startsWith(startsWith)) {
      return [
        ...foundFiles,
        path.join(directory, entry.name),
      ];
    }

    return foundFiles;
  }, []);
}

/**
 * Find the first file whom filename starts with some value in a directory.
 * 
 * @param directory The path to the directory.
 * @param startsWith Filename match to look for.
 * 
 * @returns Returns a Promise<string> that includes the path to the file if found. Returns empty
 *          string if not found.
 */
const findFirstFile = async (directory: string, startsWith: string): Promise<string> => {
  const entries = await readdirProm(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.startsWith(startsWith)) {
      return path.join(directory, entry.name);
    }
  }

  return "";
}

/**
 * Will read the provided file paths and attempt to convert each one to a Keystore object.
 * 
 * @param filePaths The paths to each file to attempt to convert
 * 
 * @returns Returns a Promise<Keystore[]> that contains metadata on each keystore file. 
 *          Returns empty array if no valid keystore files are found
 */
const readKeystoreInformation = async (filePaths: string[]): Promise<Keystore[]> => {
  const keystores: Keystore[] = [];
  for (const filePath of filePaths) {
    const fileData = await readFileProm(filePath, "utf8");
    try {
      const parsedKeystore: any = JSON.parse(fileData);
      const fileName = filePath.split('/').at(-1) || filePath;
      const keystoreIndex = fileName.split(KEYSTORE_FILE_PREFIX).at(-1)?.split('_')[0];
      keystores.push({
        publicKey: parsedKeystore.pubkey,
        shortenedPub: `${parsedKeystore.pubkey.substring(0, 6)}...${parsedKeystore.pubkey.slice(-6)}`,
        index: keystoreIndex || "Unknown index",
        fullPath: filePath,
        password: "",
        validPassword: false,
        validatorIndex: "",
      })
    } catch (e) {
      // Failed to parse file
    }
  }

  return keystores;
}

export {
  doesFileExist,
  doesDirectoryExist,
  isDirectoryWritable,
  findAllFiles,
  findFirstFile,
  readKeystoreInformation,
};