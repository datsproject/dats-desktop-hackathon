const { app, ipcMain, Menu, nativeImage, Tray, safeStorage, dialog, net } = require('electron')
const OS = require('os');
const log = require('./services/log.js');
const { autoUpdater } = require("electron-updater");
const path = require('path');
const rest = require('./services/restService.js');
const store = require('./services/store.js');
const wsl = require('./services/wsl.js');
const sender = require('./services/logSender.js');
const childProcess = require('./services/childProcess.js');
const crypto = require('./services/crypto.js');
const getmac = require('getmac');
let disconnectCount = 0;

require('dotenv').config();

//process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true
const IpMonitor = require('ip-monitor');
const ipMonitor = new IpMonitor({
    pollingInterval: 60000,
    verbose: true
});

ipMonitor.on('change', (prevIp, newIp) => {
    console.log(`IP changed from ${prevIp} to ${newIp}`);

    if (prevIp == null && newIp != null && disconnectCount < 2) {
        disconnectCount++;
    }

    /*
    if (newIp == null) {
        ipMonitor.stop();

        console.log('Network Status: Offline');
        log.logInfo('Network Status: Offline');

        const options = {
            type: 'warning',
            buttons: ['Ok'],
            defaultId: 2,
            title: 'Warning',
            message: 'Network Status: Offline. ',
            detail: 'Dats Desktop will restart.'
        };

        dialog.showMessageBox(options).then((box) => {
            console.log('Button Clicked Index - ', box.response);
            app.exit();
            app.relaunch();
        });
    }*/
    if ((prevIp != null && newIp != null) || (prevIp == null && newIp != null && disconnectCount == 2)) {
        app.exit();
        app.relaunch();
    }

});

ipMonitor.on('error', (error) => {
    console.error(error);
});

ipMonitor.start();

const {
    byOS,
    platforms: { WINDOWS, MAC, LINUX },
    byRelease,
    releases: { WIN7, WIN8, WIN10, ANY },
    currentPlatform
} = require('./services/os');


const osInfo = byOS({
    [MAC]: () => true,
    [WINDOWS]: byRelease({
        [WIN7]: () => false,
        [WIN8]: () => false,
        [WIN10]: () => true,
    }),
    [LINUX]: () => true,
    default: () => true,
});


if (!osInfo()) {
    dialog.showErrorBox('Warning', 'Your operation system is not supported this application. You should have Windows 10 or above.');
    app.quit();
}


const appMainWindow = require(path.join(app.getAppPath(), 'main-window'));
const appSplashWindow = require(path.join(app.getAppPath(), 'splash-window'));

safeStorage.isEncryptionAvailable();

//process.env.NODE_ENV = 'production';

autoUpdater.logger = log.log;
autoUpdater.logger.transports.file.level = 'info';

app.disableHardwareAcceleration();

let win = null;
let splash = null;
let isQuiting;
let tray = null;
let updateInterval = null;

app.on('before-quit', () => {
    isQuiting = true;
});

const createTray = () => {
    const icon = path.join(__dirname, 'renderer/assets/images/icons/dats-icon-32x32.png');
    const trayIcon = nativeImage.createFromPath(icon);
    tray = new Tray(trayIcon.resize({ width: 16 }));
    const contextMenu = Menu.buildFromTemplate([{
            label: 'Open Dats Desktop',
            click: () => {
                win.show();
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }
    ]);
    tray.setToolTip("Dats Desktop");
    tray.setContextMenu(contextMenu);
}

const sendUpdateStatusToWindow = (text) => {
    try {
        log.logInfo(text);
        if (win != null) {
            win.webContents.send('message', text);
        }
        // if (splash != null) {
        //     splash.webContents.send('message', text);
        // }

    } catch (error) {
        log.logError(`sendUpdateStatusMain: ${error.message}`);
    }
}

autoUpdater.on('checking-for-update', () => {
    sendUpdateStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
    sendUpdateStatusToWindow('Update available.');
    updateInterval = null;
});

autoUpdater.on('update-not-available', (info) => {
    sendUpdateStatusToWindow('Update not available.');
});

autoUpdater.on('error', (err) => {
    sendUpdateStatusToWindow('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendUpdateStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', async(info) => {
    sendUpdateStatusToWindow('Update downloaded.');

    /*
    if (process.platform !== 'darwin') {
        try {
            await wsl.unregisterDatsDistro();
        } catch (error) {
            log.logError(`distro unregister error.`);
        }
    }
    */

    autoUpdater.quitAndInstall();
});

const loadGeolocation = async() => {
    try {
        const externalIpAddress = await rest.getExternalIpAddress();
        const geolocation = await rest.getGeolocationInfoByIpAddress(externalIpAddress);
        store.remove('user_geolocation');
        store.set('user_geolocation', { externalIpAddress, geolocation });
    } catch (error) {
        log.logError(`load geolocation exception. ${error.message}`);
        console.log(`load geolocation exception. ${error.message}`);
    }
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });
}


app.whenReady().then(async() => {

    log.logInfo(`Application started. Version: ${app.getVersion()}, OS: ${currentPlatform}`);

    //console.log('THREADPOOL_SIZE: ', OS.cpus().length);

    if (process.platform === 'win32') {
        //splash = appSplashWindow.createSplashWindow();

        //const isWsl = await wsl.start(splash);
        if (true) {
            //splash.close();

            createTray();
            win = appMainWindow.createAppWindow();

            win.on('close', (event) => {
                if (!isQuiting) {
                    event.preventDefault();
                    win.hide();
                    event.returnValue = false;
                }
            });
            win.maximize();

        }
    } else {
        createTray();
        win = appMainWindow.createAppWindow();

        win.on('close', (event) => {
            if (!isQuiting) {
                event.preventDefault();
                win.hide();
                event.returnValue = false;
            }
        });
        win.maximize();
    }



    const key = process.env.AES_KEY;
    const iv = process.env.AES_IV;

    store.remove("aes_key");
    store.remove("aes_iv");
    store.set("aes_key", key);
    store.set("aes_iv", iv);

    await loadGeolocation();

    autoUpdater.checkForUpdatesAndNotify();

    //ipMonitor.start();


    updateInterval = setInterval(() => {
        if (!store.get("onAttack")) {
            autoUpdater.checkForUpdatesAndNotify()
        }
    }, 3600000);

    setInterval(() => {
        sender.sendLog(store.get("connectedAccount"));
    }, 3600000);

    setInterval(() => {
        const uptime = process.uptime();
        win.webContents.send('uptime', uptime);
    }, 1000);

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});


ipcMain.handle("getGeolocation", async() => {

    const { externalIpAddress, geolocation } = store.get('user_geolocation');

    const result = {
        externalIpAddress: externalIpAddress,
        geolocation: geolocation
    };

    return result;
});

ipcMain.on("policy", async(event, bandwidth) => {

    try {
        const isCreatedPolicy = await childProcess.checkPolicy();
        if (isCreatedPolicy) {
            await childProcess.setPolicy(bandwidth);
        } else {
            await childProcess.createPolicy(bandwidth);
        }
    } catch (error) {
        log.logError(`policy error: ${error.message}`);
    }


});

ipcMain.on('refferal', (event, code) => {
    try {
        const encryptedRefferalCode = crypto.encryptMsg(code, Buffer.from(store.get("aes_key"), "base64"), Buffer.from(store.get("aes_iv"), "base64"));

        ipcMain.handle('refferalCode', async() => {
            const { externalIpAddress } = store.get('user_geolocation');
            const macAddress = getmac.default();

            return {
                encryptedRefferalCode,
                externalIpAddress,
                macAddress
            }
        });

    } catch (error) {
        log.logError(`Create refferal code error: ${error.message}`);
    }
});

// ############ CATCH UNHANDLED EXCEPTION ###################
process.on('uncaughtException', (error) => {
    log.logError(`uncaughtException: ${error.message}`);
});