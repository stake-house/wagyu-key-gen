import { executeCommandSync, executeCommandSyncReturnStdout } from "./ExecuteCommand";

const doesFileExist = (filename: string): boolean => {
  const cmd = "test -f " + filename;
  const result = executeCommandSync(cmd);
  return result == 0;
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

export {
  doesFileExist,
  readlink,
  which
};