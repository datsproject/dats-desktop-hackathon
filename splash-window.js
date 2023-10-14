const { app, BrowserWindow } = require('electron');
const path = require('path');

let splash = null;
const createSplashWindow = () => {
    splash = new BrowserWindow({
        width: 600,
        height: 850,
        frame: true,
        autoHideMenuBar: true,
        maximizable: false,
        minimizable: false,
        webPreferences: {
            devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, "preload.js")
        },
    });

    require("@electron/remote/main").initialize();
    require("@electron/remote/main").enable(splash.webContents);

    splash.loadFile('./renderer/splash.html');
    // splash.webContents.openDevTools();
    splash.center();

    splash.on('close', () => {
        splash = null;
    });

    splash.on('closed', () => {
        splash = null;
    });

    return splash;
}

module.exports = {
    createSplashWindow
}