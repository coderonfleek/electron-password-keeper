const { app, BrowserWindow, protocol } = require("electron");
const httpRequest = require("request");
const { URL, URLSearchParams } = require("url");

const Store = require("electron-store");
const store = new Store();

/* require("es6-promise").polyfill();
require("isomorphic-fetch"); */

let win;

const customScheme = "custom-scheme";
const customDomain = "custom-domain";
const auth0Domain = "fikitout.auth0.com";
const client_id = "Ml52S0dL3GHJUuL4Q8Vl7aeL540pELiM";
const client_secret =
  "F3DqOf0xQOponkxe_yZ8oNrnqPYCWbcuzlrhW52Nr1-YSqDGQaoFwdZyUv2IoBL7";

// needed, otherwise localstorage, sessionstorage, cookies, etc, become unavailable
// https://electronjs.org/docs/api/protocol#methods
protocol.registerStandardSchemes([customScheme]);

function showWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    }
  });

  protocol.registerFileProtocol(
    customScheme,
    (request, callback) => {
      const url = request.url
        .replace(`${customScheme}://${customDomain}/`, "")
        .substring(0, request.url.length - 1);

      if (url.indexOf("home.html") === 0) {
        // needed, otherwise it will try to load a non-existing file ending with '#access_token=eyJ0...'

        const myURL = new URL(request.url);
        const code = myURL.searchParams.get("code");
        console.log(code);

        // fetch(`https://${auth0Domain}/oauth/token`, {
        //   method: "POST",
        //   headers: new Headers({
        //     "Content-Type": "text/plain"
        //   })
        // }).then(function(data) {
        //   /* handle response */
        //   console.log(data);
        // });

        var options = {
          method: "POST",
          url: `https://${auth0Domain}/oauth/token`,
          headers: { "content-type": "application/json" },
          body: {
            grant_type: "authorization_code",
            client_id: client_id,
            client_secret: client_secret,
            code: code,
            redirect_uri: `${customScheme}://${customDomain}/home.html`
          },
          json: true
        };

        httpRequest(options, function(error, response, body) {
          if (error) throw new Error(error);

          console.log(body);
          //win.localStorage.setItem(body.id_token);
          store.set("access_token", body.access_token);
          console.log(store.get("access_token"));
        });

        return callback(`${__dirname}/home.html`);
      }

      callback(`${__dirname}/${url}`);
    },
    error => {
      if (error) console.error("Failed to register protocol");
    }
  );

  // and load the index.html of the app.
  win.loadURL(`${customScheme}://${customDomain}/index.html`);

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", showWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    showWindow();
  }
});
