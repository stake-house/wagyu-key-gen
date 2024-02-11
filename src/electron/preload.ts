// preload.ts
/**
 * This typescript file contains the API used by the UI to call the electron modules.
 */

import {
  contextBridge,
  ipcRenderer,
} from "electron";

import {
  IBashUtilsAPI,
  IElectronAPI,
  IEth2DepositAPI,
  IWeb3UtilsAPI,
} from "./renderer";

contextBridge.exposeInMainWorld('electronAPI', {
  'clipboardWriteText': (...args: Parameters<IElectronAPI['clipboardWriteText']>) => ipcRenderer.send('clipboardWriteText', ...args),
  'invokeShowOpenDialog': (...args: Parameters<IElectronAPI['invokeShowOpenDialog']>) => ipcRenderer.invoke('showOpenDialog', ...args),
  'ipcRendererSendClose': () => ipcRenderer.send('close'),
  'shellShowItemInFolder': (...args: Parameters<IElectronAPI['shellShowItemInFolder']>) => ipcRenderer.send('shellShowItemInFolder', ...args),
});

contextBridge.exposeInMainWorld('eth2Deposit', {
  'createMnemonic': (...args: Parameters<IEth2DepositAPI['createMnemonic']>) => ipcRenderer.invoke('createMnemonic', ...args),
  'generateBLSChange': (...args: Parameters<IEth2DepositAPI['generateBLSChange']>) => ipcRenderer.invoke('generateBLSChange', ...args),
  'generateKeys': (...args: Parameters<IEth2DepositAPI['generateKeys']>) => ipcRenderer.invoke('generateKeys', ...args),
  'validateBLSCredentials': (...args: Parameters<IEth2DepositAPI['validateBLSCredentials']>) => ipcRenderer.invoke('validateBLSCredentials', ...args),
  'validateMnemonic': (...args: Parameters<IEth2DepositAPI['validateMnemonic']>) => ipcRenderer.invoke('validateMnemonic', ...args),
});

contextBridge.exposeInMainWorld('bashUtils', {
  'doesDirectoryExist': (...args: Parameters<IBashUtilsAPI['doesDirectoryExist']>) => ipcRenderer.invoke('doesDirectoryExist', ...args),
  'findFirstFile': (...args: Parameters<IBashUtilsAPI['findFirstFile']>) => ipcRenderer.invoke('findFirstFile', ...args),
  'isDirectoryWritable': (...args: Parameters<IBashUtilsAPI['isDirectoryWritable']>) => ipcRenderer.invoke('isDirectoryWritable', ...args),
});

contextBridge.exposeInMainWorld('web3Utils', {
  'isAddress': (...args: Parameters<IWeb3UtilsAPI['isAddress']>) => ipcRenderer.invoke('isAddress', ...args),
});
