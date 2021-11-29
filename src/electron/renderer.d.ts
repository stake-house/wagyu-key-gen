// renderer.d.ts
/**
 * This file contains the typescript type hinting for the preload.ts API.
 */

import {
  OpenDialogOptions,
  OpenDialogReturnValue
} from "electron";

import {
  FileOptions,
  FileResult
} from "tmp";

import {
  PathLike,
  Stats,
  Dirent
} from "fs"

import {
  ChildProcess
} from "child_process"

export interface IElectronAPI {
  shellOpenExternal: (url: string, options?: Electron.OpenExternalOptions | undefined) => Promise<void>,
  shellShowItemInFolder: (fullPath: string) => void,
  clipboardWriteText: (ext: string, type?: "selection" | "clipboard" | undefined) => void,
  ipcRendererSendClose: () => void,
  invokeShowOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>
}

export interface IFsAPI {
  accessSync: (path: PathLike, mode?: number | undefined) => void,
  statSync: (path: string | Buffer | URL, options?) => Stats,
  readdir: (path: PathLike, options: {
    encoding?: BufferEncoding | null;
    withFileTypes?: true | undefined;
    } | BufferEncoding | undefined | null,
    callback: (err: NodeJS.ErrnoException | null, files: Dirent[]) => void) => void,
  constantsFOK: number,
  constantsWOK: number,
  mkdir: (path: PathLike, options: MakeDirectoryOptions & {
    recursive: true;
    }, callback: (err: NodeJS.ErrnoException | null, path?: string | undefined) => void) => void,
  existsSync: (path: PathLike) => boolean
}

export interface IPathAPI {
  join: (...paths: string[]) => string
}

export interface IUtilAPI {
  promisify: (original: Function) => Function
}

export interface IUtilAPI {
  promisify: (original: Function) => Function
}

export interface IChildProcessAPI {
  execFile: (file: string, args: string[], options: Object,
    callback: (error: Error, stdout: string | Buffer, stderr: string | Buffer) => void) => ChildProcess
}

export interface IProcessAPI {
  cwd: () => string,
  platform: () => string,
  resourcesPath: () => string,
  env: () => Object
}

export interface ITmpAPI {
  fileSync: (options: FileOptions) => FileResult
}

declare global {
  interface Window {
    electronAPI: IElectronAPI,
    fsAPI: IFsAPI
    pathAPI: IPathAPI,
    utilAPI: IUtilAPI,
    childProcessAPI: IChildProcessAPI,
    processAPI: IProcessAPI,
    tmpAPI: ITmpAPI
  }
}