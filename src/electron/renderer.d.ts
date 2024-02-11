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
  clipboardWriteText: (ext: string, type?: "selection" | "clipboard" | undefined) => void,
  invokeShowOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>
  ipcRendererSendClose: () => void,
  shellShowItemInFolder: (fullPath: string) => void,
}

export interface IEth2DepositAPI {
  createMnemonic: (language: string) => Promise<string>,
  generateBLSChange: (folder: string, chain: string, mnemonic: string, index: number, indices: string, withdrawal_credentials: string, execution_address: string) => Promise<void>,
  generateKeys: (mnemonic: string, index: number, count: number, network: string,
    password: string, eth1_withdrawal_address: string, folder: string) => Promise<void>,
  validateBLSCredentials: (chain: string, mnemonic: string, index: number, withdrawal_credentials: string) => Promise<void>,
  validateMnemonic: (mnemonic: string) => Promise<void>,
}

export interface IBashUtilsAPI {
  doesDirectoryExist: (directory: string) => Promise<boolean>,
  findFirstFile: (directory: string, startsWith: string) => Promise<string>
  isDirectoryWritable: (directory: string) => Promise<boolean>,
}

export interface IWeb3UtilsAPI {
  isAddress: (address: string, chainId?: number | undefined) => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI,
    eth2Deposit: IEth2DepositAPI,
    bashUtils: IBashUtilsAPI,
    web3Utils: IWeb3UtilsAPI
  }
}