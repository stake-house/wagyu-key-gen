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

import Web3Utils from 'web3-utils';

import { createMnemonic, generateKeys, validateMnemonic, validateBLSCredentials, generateBLSChange, generateExitTransactions, generateExitTransactionsMnemonic } from './Eth2Deposit';

import { doesDirectoryExist, isDirectoryWritable, findAllFiles, findFirstFile, readKeystoreInformation } from './BashUtils';

const ipcRendererSendClose = () => {
  ipcRenderer.send('close');
};

const invokeShowOpenDialog = (options: OpenDialogOptions): Promise<OpenDialogReturnValue> => {
  return ipcRenderer.invoke('showOpenDialog', options);
};

contextBridge.exposeInMainWorld('electronAPI', {
  'shellOpenExternal': shell.openExternal,
  'shellShowItemInFolder': shell.showItemInFolder,
  'clipboardWriteText': clipboard.writeText,
  'ipcRendererSendClose': ipcRendererSendClose,
  'invokeShowOpenDialog': invokeShowOpenDialog
});

contextBridge.exposeInMainWorld('eth2Deposit', {
  'createMnemonic': createMnemonic,
  'generateKeys': generateKeys,
  'validateMnemonic': validateMnemonic,
  'validateBLSCredentials': validateBLSCredentials,
  'generateBLSChange': generateBLSChange,
  'generateExitTransactions': generateExitTransactions,
  'generateExitTransactionsMnemonic': generateExitTransactionsMnemonic
});

contextBridge.exposeInMainWorld('bashUtils', {
  'doesDirectoryExist': doesDirectoryExist,
  'isDirectoryWritable': isDirectoryWritable,
  'findAllFiles': findAllFiles,
  'findFirstFile': findFirstFile,
  'readKeystoreInformation': readKeystoreInformation
});

contextBridge.exposeInMainWorld('web3Utils', {
  'isAddress': Web3Utils.isAddress
});