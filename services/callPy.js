const path = require('path');
const spawn = require('child_process').spawn;
const childProc = require('child_process');
const appMainWindow = require('../main-window');
const mqtt = require('./MQTT.js');
const store = require('./store.js');

const platform = process.platform;
const startPath = platform == "win32" ? "./start.exe" : path.join(__dirname, "../start");

const callPyFileL4 = (clientId, method, url, threads, duration, tools, publishObj) => {
    let output = [];
    let jsonObj = { "account": clientId };
    let logs = 'logs';
    let logStr = '';
    jsonObj[logs] = [];

    let row = [];

    //__dirname + "/start", 

    const proc = require("child_process").execFile(startPath, [method, url, threads, duration, tools], {
        detached: true,
    });

    proc.stdout.setEncoding('utf-8');
    proc.stdout.on('data', data => {
        console.log(data);
    });

    proc.stderr.setEncoding('utf-8');
    proc.stderr.on('data', err => {

        //console.log(String(err));
        row = [];
        logStr = '';
        if (err.toString().includes('DEBUG')) {
            row.push(err.toString('utf-8')
                .substring(18, err.length)
                .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
                .replace('\n', '')
                .split(','));
            logStr += '{'
            for (let i = 0; i < row[0].length; i++) {
                try {
                    logStr += `"${row[0][i].toString().split(':')[0].trimLeft()}": "${row[0][i].toString().split(':')[1].trimLeft()}",`;
                } catch (error) {
                    continue;
                }
            }
            logStr = logStr.substring(0, logStr.length - 1);
            logStr += '},';

            const rowJson = JSON.parse(logStr.substring(0, logStr.length - 1).replace('\r', ''));
            // console.log(rowJson);
            // console.log(rowJson["BPS"]);
            if (rowJson["BPS"]) {
                let bps = rowJson["BPS"].split('/')[0];
                bps = bps.trim();
                if (!bps.includes('--')) {
                    publishObj.bandWidth = bps;
                    //console.log(publishObj);
                    mqtt.onSendMqtt('userdatacollector', 0, JSON.stringify(publishObj));
                }
            }

            jsonObj[logs].push(logStr.substring(0, logStr.length - 1));
        }

        //console.log(row);

        output.push(row);
    });

    proc.stdout.on('end', () => {
        console.log('the end.');
        console.log(jsonObj);
        //onAttack = false;
        store.set("onAttack", false);
        //appMainWindow.getAppWindow().webContents.send("finishAttackNotify", jsonObj);
    });

    proc.on('close', (code, signal) => {
        console.log(`child process closed with code ${code} and signal ${signal}`);
    });

    proc.on('exit', () => {
        console.log('exited.');
    });

    return proc;

}

const callPyFileL7 = (clientId, method, url, socksType, threads, proxyList, ratePerSeconds, duration, tools, publishObj) => {

    let output = [];
    let jsonObj = { "account": clientId };
    let logs = 'logs';
    let logStr = '';
    jsonObj[logs] = [];

    let row = [];

    const proc = require("child_process").execFile(startPath, [method, url, socksType, threads, proxyList, ratePerSeconds, duration, tools], {
        //spawn('python3', [filePath, method, url, threads, duration, tools], {
        detached: true,
    });

    proc.stdout.setEncoding('utf-8');
    proc.stdout.on('data', data => {
        console.log(data);
    });

    proc.stderr.setEncoding('utf-8');
    proc.stderr.on('data', err => {
        //console.log(String(err));
        row = [];
        logStr = '';
        if (err.toString().includes('DEBUG')) {
            row.push(err.toString('utf-8')
                .substring(18, err.length)
                .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
                .replace('\n', '')
                .split(','));
            logStr += '{'
            for (let i = 0; i < row[0].length; i++) {
                try {
                    logStr += `${row[0][i].toString().split(':')[0].trimLeft()}: ${row[0][i].toString().split(':')[1].trimLeft()},`;
                } catch (error) {
                    continue;
                }
            }
            logStr = logStr.substring(0, logStr.length - 1);
            logStr += '},';

            const rowJson = JSON.parse(logStr.substring(0, logStr.length - 1).replace('\r', ''));
            // console.log(rowJson);
            // console.log(rowJson["BPS"]);
            if (rowJson["BPS"]) {
                let bps = rowJson["BPS"].split('/')[0];
                bps = bps.trim();
                if (!bps.includes('--')) {
                    publishObj.bandWidth = bps;
                    mqtt.onSendMqtt('userdatacollector', 0, JSON.stringify(publishObj));
                }
            }

            jsonObj[logs].push(logStr.substring(0, logStr.length - 1));
        }

        console.log(row);

        output.push(row);
    });

    proc.stdout.on('end', () => {
        console.log('the end.');
        console.log(jsonObj);
        store.set("onAttack", false);
        appMainWindow.getAppWindow().webContents.send("finishAttackNotify", jsonObj);
    });

    proc.on('close', (code, signal) => {
        console.log(`child process closed with code ${code} and signal ${signal}`);
    });

    proc.on('exit', () => {
        console.log('exited.');
    });

    return proc;

}

module.exports = {
    callPyFileL4,
    callPyFileL7
}