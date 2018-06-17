const {app, BrowserWindow, protocol} = require('electron');

let win;

// needed, otherwise localstorage, sessionstorage, cookies, etc, become unavailable
// https://electronjs.org/docs/api/protocol#methods
protocol.registerStandardSchemes(['atom']);

function showWindow() {

  protocol.registerFileProtocol('atom', (request, callback) => {
    const url = request.url.replace('atom://my-app/', '').substring(0, request.url.length - 1);

    if (url.indexOf('home.html') === 0) {
      // needed, otherwise it will try to load a non-existing file ending with '#access_token=eyJ0...'
      return callback(`${__dirname}/home.html`);
    }

    callback(`${__dirname}/${url}`);
  }, (error) => {
    if (error) console.error('Failed to register protocol')
  });

  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    }
  });

  // and load the index.html of the app.
  win.loadURL(`atom:///my-app/index.html`);

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', showWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    showWindow();
  }
});
