const { BrowserWindow } = require('electron');
const path = require('path');

require('./server.js');

let win;

const createAppWindow = () => {

    win = new BrowserWindow({
        width: 1024,
        height: 768,
        show: false,
        minimizable: process.platform === 'win32' ? true : false,
        webPreferences: {
            //devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, "preload.js")
        },
        autoHideMenuBar: true
    });

    //if (process.platform === 'darwin') require("@electron/remote/main").initialize();
    require("@electron/remote/main").initialize();
    require("@electron/remote/main").enable(win.webContents);

    //win.loadFile("./renderer/index.html");
    win.loadURL(`http://localhost:3030/`);

    return win;
};

const getAppWindow = () => win;

module.exports = {
    createAppWindow,
    getAppWindow
}