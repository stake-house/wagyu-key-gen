import { executeCommandSync, executeCommandSyncReturnStdout } from "./ExecuteCommand";

const doesFileExist = (filename: string): boolean => {
  const cmd = "test -f " + filename;
  const result = executeCommandSync(cmd);
  return result == 0;
};

const ls = (): string => {
  return executeCommandSyncReturnStdout("ls").trim();
}

const pwd = (): string => {
  return executeCommandSyncReturnStdout("pwd").trim();
}

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
  ls,
  pwd,
  readlink,
  uname,
  which
};