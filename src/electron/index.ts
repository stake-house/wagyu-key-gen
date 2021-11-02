import { BrowserWindow, app, globalShortcut, ipcMain } from "electron";
import path from "path";

import { accessSync, constants } from "fs";

const doesFileExist = (filename: string): boolean => {
  try {
    accessSync(filename, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};

app.on("ready", () => {
  // once electron has started up, create a window.
  var iconPath = path.join("static", "icon.png");
  const bundledIconPath = path.join(process.resourcesPath, "..", "static", "icon.png");
  if (doesFileExist(bundledIconPath)) {
    iconPath = bundledIconPath;
  }

  const title = `${app.getName()}`;

  const window = new BrowserWindow({
    width: 950,
    height: 750,
    icon: iconPath,
    title: title,

    webPreferences: {
      nodeIntegration: true,

      // TODO: is it a problem to disable this?
      // https://www.electronjs.org/docs/tutorial/context-isolation#security-considerations
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  // hide the default menu bar that comes with the browser window
  window.setMenuBarVisibility(false);

	globalShortcut.register('CommandOrControl+R', function() {
		console.log('CommandOrControl+R is pressed')
		window.reload()
	})

  ipcMain.on('close', (evt, arg) => {
    app.quit()
  })

  // load a website to display
  window.loadURL(`file://${__dirname}/../react/index.html`);
});
