import { executeCommandSync, executeCommandSyncReturnStdout } from "./ExecuteCommand";

import { accessSync, constants } from "fs";

const doesFileExist = (filename: string): boolean => {
  try {
    accessSync(filename, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};

//TODO: add error handling
const readlink = (file: string): string => {
  return executeCommandSyncReturnStdout("readlink -f " + file).trim();
}

const which = (tool: string): boolean => {
  const cmd = "which " + tool;
  const result = executeCommandSync(cmd);
  return result == 0;
}

const uname = (): string => {
  return executeCommandSyncReturnStdout("uname").trim();
}

export {
  doesFileExist,
  readlink,
  uname,
  which
};