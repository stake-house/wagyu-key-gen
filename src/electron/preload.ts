// preload.ts
/**
 * This typescript file contains the API used by the UI to call the electron modules.
 */

import {
  contextBridge,
  shell,
  clipboard,
  ipcRenderer,
  OpenDialogOptions,
  OpenDialogReturnValue
} from "electron";

import { accessSync, statSync, readdir, constants, mkdir, existsSync } from "fs";
import path from "path";
import { promisify } from "util";
import { execFile } from "child_process";
import { cwd, platform, resourcesPath, env } from "process"

import { fileSync } from "tmp";

const ipcRendererSendClose = () => {
  ipcRenderer.send('close');
};

const invokeShowOpenDialog = (options: OpenDialogOptions): Promise<OpenDialogReturnValue> => {
  return ipcRenderer.invoke('showOpenDialog', options);
};

const getPlatform = (): string => {
  return platform;
}

const getResourcesPath = (): string => {
  return resourcesPath;
}

const getEnv = (): Object => {
  return env;
}

contextBridge.exposeInMainWorld('electronAPI', {
  'shellOpenExternal': shell.openExternal,
  'shellShowItemInFolder': shell.showItemInFolder,
  'clipboardWriteText': clipboard.writeText,
  'ipcRendererSendClose': ipcRendererSendClose,
  'invokeShowOpenDialog': invokeShowOpenDialog
});

contextBridge.exposeInMainWorld('fsAPI', {
  'accessSync': accessSync,
  'statSync': statSync,
  'readdir': readdir,
  'constantsFOK': constants.F_OK,
  'constantsWOK': constants.W_OK,
  'mkdir': mkdir,
  'existsSync': existsSync
});

contextBridge.exposeInMainWorld('pathAPI', {
  'join': path.join
})

contextBridge.exposeInMainWorld('utilAPI', {
  'promisify': promisify
})

contextBridge.exposeInMainWorld('childProcessAPI', {
  'execFile': execFile
})

contextBridge.exposeInMainWorld('processAPI', {
  'cwd': cwd,
  'platform': getPlatform,
  'resourcesPath': getResourcesPath,
  'env': getEnv
})

contextBridge.exposeInMainWorld('tmpAPI', {
  'fileSync': fileSync
})