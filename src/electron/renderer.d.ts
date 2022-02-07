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

export interface IEth2DepositAPI {
  createMnemonic: (language: string) => Promise<string>,
  generateKeys: (mnemonic: string, index: number, count: number, network: string,
    password: string, eth1_withdrawal_address: string, folder: string) => Promise<void>,
  validateMnemonic: (mnemonic: string) => Promise<void>
}

export interface IBashUtilsAPI {
  doesDirectoryExist: (directory: string) => Promise<boolean>,
  isDirectoryWritable: (directory: string) => Promise<boolean>,
  findFirstFile: (directory: string, startsWith: string) => Promise<string>
}

export interface IWeb3UtilsAPI {
  isAddress: (address: string, chainId?: number | undefined) => boolean
}

declare global {
  interface Window {
    electronAPI: IElectronAPI,
    eth2Deposit: IEth2DepositAPI,
    bashUtils: IBashUtilsAPI,
    web3Utils: IWeb3UtilsAPI
  }
}