const { ipcRenderer } = require('electron');
const fs = require("fs");
const remote = require("@electron/remote");
const log = remote.require('./services/log.js');
const childProcess = remote.require('./services/childProcess.js');

const webContents = remote.getCurrentWebContents();

webContents.on("did-finish-load", async() => {
    console.log("App Version:", remote.app.getVersion());
    document.querySelector("#appVersionInfo").innerHTML = `<small>v${remote.app.getVersion()}</small>`
});

ipcRenderer.on('message', function(event, text) {
    console.log("Auto Updater Message:", text);
});

ipcRenderer.on('uptime', (event, totalSeconds) => {
    let days = Math.floor(totalSeconds / (3600 * 24));
    let hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = Math.floor(totalSeconds % 60);

    let result = `<small>${days} day, ${hours} hr, ${minutes} min, ${seconds} sec</small>`;

    document.querySelector('#timeCounter').innerHTML = result;
})

const showRangeValue = (newValue) => {
    document.getElementById('selectedMbitRangeValue').innerHTML = `${newValue} mbit`;
}

const showCpuRangeValue = (newValue) => {
    document.getElementById('selectedCpuRangeValue').innerHTML = `${newValue} core`;
}