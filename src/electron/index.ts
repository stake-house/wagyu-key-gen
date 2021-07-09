import { BrowserWindow, app, globalShortcut, ipcMain } from "electron";

app.on("ready", () => {
  // once electron has started up, create a window.
  const window = new BrowserWindow({
    width: 900,
    height: 720,
    icon: 'src/images/ethstaker_icon_1.png',

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
