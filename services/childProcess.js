const execute = require('./execute.js');
const path = require('path');
const fs = require('fs');

const commands = [
    { index: 0, command: 'powershell.exe', args: ['Get-NetQosPolicy', '-PolicyStore', '"ActiveStore"'] },
    { index: 1, command: 'powershell.exe', args: ['New-NetQosPolicy', '-Name', 'DatsBandwidthPolicy', '-AppPathNameMatchCondition', '01-dats_service.exe', '-IPProtocolMatchCondition', 'Both', '-NetworkProfile', 'All', '-ThrottleRateActionBitsPerSecond'] },
    { index: 2, command: 'powershell.exe', args: ['Set-NetQosPolicy', '-Name', 'DatsBandwidthPolicy', '-ThrottleRateActionBitsPerSecond'] },
    { index: 3, command: 'powershell.exe', args: ['Remove-NetQosPolicy', '-Name', 'DatsBandwidthPolicy'] },
    { index: 4, command: 'powershell.exe', args: ['cat', `"C:\\Program Files\\Dats Project\\logs\\datssnifferlog.txt"`] },
    { index: 5, command: 'powershell.exe', args: ['Clear-Content', `"C:\\Program Files\\Dats Project\\logs\\datssnifferlog.txt"`, '-Force'] },
    { index: 6, command: 'cat', args: ['/var/log/datssnifferlog.txt'] },
    //cat /dev/null > /var/log/datssnifferlog.txt
    { index: 7, command: 'cat', args: ['/dev/null', '>', '/var/log/datssnifferlog.txt'] },
    //sudo chmod -R +xw /var/log/
    { index: 8, command: 'chmod', args: ['-R', '+xw', '/var/log/'] },
    { index: 9, command: 'truncate', args: ['-s', '0', '/var/log/datssnifferlog.txt'] },
]

const snifferLogFilePath = 'C:\\Program Files\\Dats Project\\logs\\datssnifferlog.txt';

const checkPolicy = async() => {
    let result = false;

    const output = await execute.runCommandPromise(commands, 0);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    console.log('checkPolicy output:', lines);
    if (lines.length == 0) return false;

    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("datsbandwidthpolicy")) {
            console.log('line:', lines[index][0])
            result = true;
            break;
        }
    }

    return result;
}

const getPolicyBandwidth = async() => {
    let result = 0;

    const output = await execute.runCommandPromise(commands, 0);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    console.log('getPolicyBandwidth output:', lines);
    if (lines.length == 0) return false;


    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("ThrottleRate")) {
            console.log('line:', lines[index][0])
            result = parseInt(lines[index][0].replace("ThrottleRate :", "").replace("MBits/sec", "").trim());
            break;
        }
    }


    return result;
}

const createPolicy = async(bandwidth) => {
    let result = false;

    commands[1].args.push((parseInt(bandwidth) * 1000000).toString());

    const output = await execute.runCommandPromise(commands, 1);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    console.log('createPolicy output:', lines);
    if (lines.length == 0) return false;

    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("datsbandwidthpolicy")) {
            console.log('line:', lines[index][0])
            result = true;
            break;
        }
    }

    return result;
}

const setPolicy = async(bandwidth) => {
    let result = false;

    commands[2].args.push((parseInt(bandwidth) * 1000000).toString());

    const output = await execute.runCommandPromise(commands, 2);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    console.log('setPolicy output:', lines);
    if (lines.length == 0) return true;

    return result;
}

const executeDDosProcess = async(params) => {
    const platform = process.platform;
    const startPath = platform == 'win32' ? "./01-dats_service.exe" : path.join(__dirname, `../01-dats_service_${process.platform}`);

    await clearDatsSnifferLog();

    return await execute.execFileCommandProcess(startPath, params);
}

const executeDatsSnifferProcess = async(params) => {
    const platform = process.platform;
    const startPath = platform == "win32" ? "./datssniffer.exe" : path.join(__dirname, `../datssniffer_${process.platform}`);

    return await execute.execFileCommandProcess(startPath, params);
}

const readDatsSnifferLog = async() => {
    return await execute.runCommandPromise(commands, process.platform !== 'darwin' ? 4 : 6);
}

const clearDatsSnifferLog = async() => {

    if (process.platform === 'win32') {

        if (!fs.existsSync(snifferLogFilePath)) {
            return null;
        }

        return await execute.runCommandPromise(commands, 5);
    } else {
        return await execute.execCommand(commands, 7);
    }

}

module.exports = {
    checkPolicy,
    getPolicyBandwidth,
    createPolicy,
    setPolicy,
    executeDDosProcess,
    executeDatsSnifferProcess,
    readDatsSnifferLog
}