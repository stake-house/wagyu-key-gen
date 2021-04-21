import { exec, execSync, spawn } from 'child_process';
import { streamEnd, streamWrite } from '@rauschma/stringio';

import { Writable } from 'stream';

// TODO: better error handling and logging
// TODO: remove console.log

// TODO: make this work for different operating systems
const UBUNTU_TERMINAL_COMMAND = "/usr/bin/gnome-terminal";

type StdoutCallback = (text: string) => void;

const executeCommandAsync = async (cmd: string): Promise<any> => {
  console.log("running command async with: " + cmd);

  return new Promise((resolve, reject) => {
    const child = exec(cmd);

    child.once('exit', function (code) {
      resolve(code);
    });
    
    child.on('error', function (err) {
      reject(err);
    });
  });
}

const executeCommandInNewTerminal = (cmd: string, title: string): number => {
  return executeCommandSync(UBUNTU_TERMINAL_COMMAND + " --title=\"" + title + "\" -- bash -c '" + cmd + "'");
}

const executeCommandSync = (cmd: string): number => {
  console.log("running command sync with: " + cmd);

  try {
    execSync(cmd, {stdio: 'inherit'});
    return 0;
  } 
  catch (error) {
    // TODO: more robust error handling
    error.status;
    error.message;
    error.stderr;
    error.stdout;
    console.log(error.message);
    return error.status;
  }
}

const executeCommandSyncReturnStdout = (cmd: string): string => {
  console.log("running command sync stdout with: " + cmd);

  try {
    return execSync(cmd).toString();
  } 
  catch (error) {
    // TODO: more robust error handling
    error.status;
    error.message;
    error.stderr;
    error.stdout;
    console.log(error.message);
    return error.message;
  }
}

const executeCommandStream = (cmd: string, stdoutCallback: StdoutCallback): Promise<any> => {
  console.log("running command stream with: " + cmd);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, {
      shell: true
    });

    child.stdout.on('data', (data: Buffer) => {
      stdoutCallback(data.toString());
    });

    child.stderr.on('data', (data: Buffer) => {
      stdoutCallback(data.toString());
    });

    child.once('exit', function (code) {
      resolve(code);
    });

    child.on('error', function (err) {
      reject(err);
    });
  });
}


// good resource for this: https://2ality.com/2018/05/child-process-streams.html
const executeCommandWithPromptsAsync = (cmd: string, responses: string[], stdoutCallback: StdoutCallback): Promise<any> => {
  console.log("running command with prompts async with: " + cmd + " and responses " + responses.join());

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, {
      stdio: ['pipe', 'pipe', process.stderr],
      shell: true,
    });

    child.stdout.on('data', (data: Buffer) => {
      stdoutCallback(data.toString());
    });

    writeToWritable(child.stdin, responses);

    child.once('exit', function (code) {
      resolve(code);
    });
    
    child.on('error', function (err) {
      reject(err);
    });
  });
}

// TODO: using this sync wait to get the prompt responses to work properly is
// probably not the best - come up with alternative solution
const syncWait = (ms: number) => {
  const end = Date.now() + ms
  while (Date.now() < end) continue
}

async function writeToWritable(writable: Writable, responses: string[]) {
  syncWait(1000);
  for (const response of responses) {
    console.log("writing '" + response + "'");
    await streamWrite(writable, response);
    syncWait(1000);
  }

  await streamEnd(writable);
}

export {
  executeCommandAsync,
  executeCommandInNewTerminal,
  executeCommandStream,
  executeCommandSync,
  executeCommandSyncReturnStdout,
  executeCommandWithPromptsAsync,
};