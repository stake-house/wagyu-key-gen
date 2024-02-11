// index.ts
/**
 * This typescript file contains the Electron app which renders the React app.
 */

import {
  BrowserWindow,
  app,
  clipboard,
  dialog,
  ipcMain,
  shell,
} from "electron";
import { OpenDialogOptions } from "electron/common";
import { accessSync, constants } from "fs";
import path from "path";
import { isAddress } from 'web3-utils';

import {
  doesDirectoryExist,
  findFirstFile,
  isDirectoryWritable,
} from './BashUtils';
import {
  createMnemonic,
  generateBLSChange,
  generateKeys,
  validateBLSCredentials,
  validateMnemonic,
} from './Eth2Deposit';

/**
 * VERSION and COMMITHASH are set by the git-revision-webpack-plugin module.
 */
declare var VERSION: string;
declare var COMMITHASH: string;

const doesFileExist = (filename: string): boolean => {
  try {
    accessSync(filename, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};

app.on("ready", () => {
  var iconPath = path.join("static", "icon.png");
  const bundledIconPath = path.join(process.resourcesPath, "..", "static", "icon.png");

  if (doesFileExist(bundledIconPath)) {
    iconPath = bundledIconPath;
  }

  const title = `${app.getName()} ${VERSION}-${COMMITHASH}`;

  /**
   * Create the window in which to render the React app
   */
  const window = new BrowserWindow({
    width: 950,
    height: 750,
    icon: iconPath,
    title: title,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  /**
   * Hide the default menu bar that comes with the browser window
   */
  window.setMenuBarVisibility(false);

  /**
   * Set the Permission Request Handler to deny all permissions requests
   */
  window.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    return callback(false);
  });

  /**
   * This logic closes the application when the window is closed, explicitly.
   * On MacOS this is not a default feature.
   */
  ipcMain.on('close', () => {
    app.quit();
  });

  /**
   * Will grab the provide text and copy to the cipboard
   */
  ipcMain.on('clipboardWriteText', (evt, ext, type) => {
    clipboard.writeText(ext, type);
  });

  /**
   * Will open a file explorer to the path provided
   */
  ipcMain.on('shellShowItemInFolder', (event, fullPath: string) => {
    shell.showItemInFolder(fullPath);
  });

  /**
   * Provides the renderer a way to call the dialog.showOpenDialog function using IPC.
   */
  ipcMain.handle('showOpenDialog', async (event, options: OpenDialogOptions) => {
    return await dialog.showOpenDialog(options);
  });

  /**
   * Passthroughs for non-electron renderer calls
   */
  ipcMain.handle('createMnemonic', async (event, ...args: Parameters<typeof createMnemonic>) => {
    return await createMnemonic(...args);
  });
  ipcMain.handle('generateBLSChange', async (event, ...args: Parameters<typeof generateBLSChange>) => {
    return await generateBLSChange(...args);
  });
  ipcMain.handle('generateKeys', async (event, ...args: Parameters<typeof generateKeys>) => {
    return await generateKeys(...args);
  });
  ipcMain.handle('validateBLSCredentials', async (event, ...args: Parameters<typeof validateBLSCredentials>) => {
    return await validateBLSCredentials(...args);
  });
  ipcMain.handle('validateMnemonic', async (event, ...args: Parameters<typeof validateMnemonic>) => {
    return await validateMnemonic(...args);
  });
  ipcMain.handle('doesDirectoryExist', async (event, ...args: Parameters<typeof doesDirectoryExist>) => {
    return await doesDirectoryExist(...args);
  });
  ipcMain.handle('isDirectoryWritable', async (event, ...args: Parameters<typeof isDirectoryWritable>) => {
    return await isDirectoryWritable(...args);
  });
  ipcMain.handle('findFirstFile', async (event, ...args: Parameters<typeof findFirstFile>) => {
    return await findFirstFile(...args);
  });
  ipcMain.handle('isAddress', async (event, ...args: Parameters<typeof isAddress>) => {
    return await isAddress(...args);
  });

  /**
   * Load the react app
   */
  window.loadURL(`file://${__dirname}/../react/index.html`);
});

app.on('will-quit', () => {
  /**
   * Clear clipboard on quit to avoid access to any mnemonic or password that was copied during
   * application use.
   */
  clipboard.clear();
})
