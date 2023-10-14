const { app, ipcMain } = require('electron');
const { spawn } = require('child_process');
const execute = require('./execute.js');
const rest = require('./restService.js');
const { downloadFile } = require('./download.js');
const path = require('path');
const log = require('./log.js');
const fs = require('fs');
const os = require('os');


const distroPath = "C:\\Program Files\\Dats Project\\distro"; //path.join(app.getAppPath() + '/distro');
const distroFilePath = "C:\\Program Files\\Dats Project\\distro\\dats-distro.tar"; //path.join(app.getAppPath() + '/distro/dats-distro.tar');
//dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
const commands = [
    { index: 0, command: 'powershell.exe', args: ['wsl', '--status'] },
    //{ index: 1, command: 'powershell.exe', args: ['Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart'] },
    { index: 1, command: 'dism.exe', args: ['/online', '/enable-feature', '/featurename:Microsoft-Windows-Subsystem-Linux', '/all', '/norestart'] },
    { index: 2, command: 'powershell.exe', args: ['wsl', '-l', '-q'] },
    { index: 3, command: 'curl', args: ['-o dats-distro.tar https://github.com/datsproject/dats-distro/raw/master/dats-distro.tar'] },
    { index: 4, command: 'mkdir', args: [`"${distroPath}"`] },
    //{ index: 5, command: 'powershell.exe', args: ['wsl', '--import', 'dats-distro', `"C:\\Program Files\\Dats Project\\distro"`, `"C:\\Program Files\\Dats Project\\distro\\dats-distro.tar"`] },
    { index: 5, command: 'powershell.exe', args: ['wsl', '--import', 'dats-distro', `'${distroPath}'`, `"${distroFilePath}"`] },
    { index: 6, command: 'powershell.exe', args: ['wsl', '--set-default-version', '2'] },
    { index: 7, command: 'powershell.exe', args: ['wsl', '--set-default', 'dats-distro'] },
    { index: 8, command: 'powershell.exe', args: ['wsl', '-l', '-v'] },
    { index: 9, command: 'powershell.exe', args: ['wsl', '--set-version', 'dats-distro', '2'] },
    { index: 10, command: 'powershell.exe', args: ['wsl', 'cat', '/etc/dats/.distro_version'] },
    { index: 11, command: 'powershell.exe', args: ['wsl', '--unregister', 'dats-distro'] },
    { index: 12, command: 'powershell.exe', args: ['wsl', '-l', '--running'] },
    { index: 13, command: 'powershell.exe', args: ['wsl', '-d', 'dats-disto', 'echo', 'test'] },
    { index: 14, command: 'powershell.exe', args: ['wsl', 'dats', '--config', '/etc/dats/dats.cfg'] }, //'/mnt/c/Program\ Files/Dats\ Project/distro/dats.cfg'
    { index: 15, command: 'powershell.exe', args: ['wsl', 'tail', '-f', '/var/log/datswatcherlog.txt'] },
    { index: 16, command: 'powershell.exe', args: ['wsl', 'killall', 'tail'] },
    { index: 17, command: 'powershell.exe', args: ['wsl', 'cat', '/var/log/datssnifferlog.txt'] },
    { index: 18, command: 'powershell.exe', args: ['wsl', 'truncate -s 0 /var/log/datswatcherlog.txt'] },
    { index: 19, command: 'powershell.exe', args: ['wsl', 'truncate -s 0 /var/log/datssnifferlog.txt'] },
    { index: 20, command: 'powershell.exe', args: ['wsl', 'killall', 'dats'] },
    { index: 21, command: 'powershell.exe', args: ['wsl', '--update'] },
    { index: 22, command: 'dism.exe', args: ['/online', '/enable-feature', '/featurename:VirtualMachinePlatform', '/all', '/norestart'] },

];

let distroUrl = "";

const delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

const start = async(splash) => {
    await delay(1000);
    try {
        splash.webContents.send('wsl-message', "Starting check dependencies...");
        await delay(2000);

        splash.webContents.send('wsl-message', "Checking CPU Virtualization is enabled.");
        await delay(2000);

        const isVirtualization = isVirtualizationEnabled();
        if (!isVirtualization) {
            throw new Error('Your CPU Virtualization is not enabled.');
        }

        /*
        const wsl = await checkWsl();
        if (!wsl) {
            const isActivateWsl = await activateWsl();
            if (isActivateWsl) {
                console.log('Wsl activated.');
                splash.webContents.send('wsl-message', "Wsl activated");
                await delay(2000);
            } else {
                console.log('Your system does not support wsl.');
                splash.webContents.send('wsl-message', "Your system does not support wsl.");
                throw new Error('Your system does not support wsl.');
            }
        }

        */

        const isActivateWsl = await activateWsl();
        if (!isActivateWsl) {
            //console.log('Your system does not support wsl.');
            //splash.webContents.send('wsl-message', "Your system does not support wsl.");
            throw new Error('Your system does not support wsl.');
        }

        //console.log('Wsl activated.');
        splash.webContents.send('wsl-message', "Wsl has been activated.");
        await delay(2000);

        const isVirtualMachine = await enableVirtualMachinePlatform();
        if (!isVirtualMachine) {
            throw new Error('Your system does not virtual machine.');
        }

        splash.webContents.send('wsl-message', "WM Platform has been enabled.");
        await delay(2000);


        try {
            const isUpdateWsl = await updateWsl();
            if (!isUpdateWsl) {
                //splash.webContents.send('wsl-message', "Wsl is not updated.");
                throw new Error('Wsl is not updated.');
            }

            splash.webContents.send('wsl-message', "Wsl has been updated.");
            await delay(2000);
        } catch (error) {
            splash.webContents.send('wsl-message', "Skipping wsl update.");
            await delay(2000);
        }

        try {
            if (!fs.existsSync(distroFilePath)) {
                await unregisterDatsDistro();
            }
        } catch (error) {
            console.log('distro does not unregister.');
        }


        let tryCount = 0;

        // Version kontrolü infinity loop a dikkat.
        start_check_distro: while (true) {

            if (tryCount > 1) {
                break;
            }

            splash.webContents.send('wsl-message', "Checking wsl distro on system.");
            await delay(2000);

            const wslDistro = await checkWslDistro();
            if (!wslDistro) {
                /*

                    - distro indir (curl -o dats-distro.tar https://github.com/datsproject/dats-distro/raw/master/dats-distro.tar)
                    - uygulama dizininde distro dizini oluştur. (mkdir distro)
                    - wsl distro import et. (wsl --import dats-dsitro 'C:\Program Files\Dats Project\distro' 'C:\Program Files\Dats Project\dats-desktop.tar')
                    - wsl version 2 set et (wsl --set-default-version 2)
                    - wsl dats-distro default distro olarak set et. (wsl --set-default dats-distro)
                */
                splash.webContents.send('wsl-message', "Install and import wsl distro.");
                await delay(2000);

                await installAndImportDistro();

            }

            splash.webContents.send('wsl-message', "Dats Distro set as default.");
            await delay(2000);

            const isSetDefaultDistro = await datsDistroSetDefault();
            if (!isSetDefaultDistro) {
                throw new Error('Dats Distro could not set as default.');
            }


            splash.webContents.send('wsl-message', "Checking wsl distro version.");
            await delay(2000);

            const wslDistroVersion = await checkWslDistroVersion();
            if (!wslDistroVersion) {
                await setWslDistroVersion();
            }

            splash.webContents.send('wsl-message', "Checking wsl dats distro version.");
            await delay(2000);

            const datsDistroVersion = await checkDatsDistroVersion();
            if (!datsDistroVersion) {
                // distro unregister
                await unregisterDatsDistro();
                tryCount++;
                continue start_check_distro;
            }

            splash.webContents.send('wsl-message', "Checking wsl dats distro is running.");
            await delay(2000);

            const isRunningDatsDistro = await checkDatsDistroRunning();
            if (!isRunningDatsDistro) {
                await runDatsDistro();
            }

            break;
        }

        if (tryCount > 1) {
            throw new Error('Version could not be verified.');
        }

        splash.webContents.send('wsl-message', "Dats Project opens...");
        await delay(2000);

        //console.log("Dats Project opens...");

        return true;

    } catch (error) {
        log.logError(`Error: ${error.message}`);
        splash.webContents.send('wsl-message', `Check dependencies error: ${error.message}`);
    }
}

const isVirtualizationEnabled = () => {
    if (os.platform() !== 'win32') {
        return false;
    }

    const output = require('child_process').execSync('systeminfo').toString('utf8');
    const lines = output.split('\n');

    let isEnabled = true;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Virtualization Enabled In Firmware: No')) {
            isEnabled = false;
        } else if (lines[i].includes('Virtualization Enabled In Windows: No')) {
            virtualizationEnabledInWindows = false;
        } else if (!lines[i].includes('hypervisor has been detected')) {
            hypervisorDetected = false;
        }
    }

    return isEnabled;
};

/*
const checkWsl = async() => {

    let result = true;

    const output = await execute.runCommandError(commands, 0);

    if (output.includes('##ERROR##')) {
        result = false;
    }

    //https://stackoverflow.com/questions/73354950/parsing-output-of-wsl-list-verbose-in-javascript

   
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, '')) // remove all \u0000
        .map(v => { // remove all double spaces
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v) // remove empty lines
        .map(v => v.split('\n')); // split by space

    console.log('checkWsl output:', lines);


    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("Windows Subsystem for Linux was last updated on")) {
            console.log('line:', lines[index][0])
            result = true;
            break;
        }
    }
    

    return result;

}
*/
const activateWsl = async() => {
    const output = await execute.runCommandError(commands, 1);
    let result = false;
    //let regexp = new RegExp(/Online\s\s\s\s\s\s\s\s:\sTrue/);
    //console.log('activateWsl output: ', output);

    if (output.includes('##SUCCESS##')) {
        result = true;
    }

    return result;
}

const enableVirtualMachinePlatform = async() => {
    const output = await execute.runCommandError(commands, 22);
    let result = false;
    //let regexp = new RegExp(/Online\s\s\s\s\s\s\s\s:\sTrue/);
    //console.log('activateWsl output: ', output);

    if (output.includes('##SUCCESS##')) {
        result = true;
    }

    return result;
}

const updateWsl = async() => {
    const output = await execute.runCommandError(commands, 21);
    let result = false;
    if (output.includes('##SUCCESS##')) {
        result = true;
    }
    return result;
}

const checkWslDistro = async() => {
    let result = false;

    const output = await execute.runCommandPromise(commands, 2);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    //console.log('checkWslDistro output:', lines);

    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("dats-distro")) {
            //console.log('line:', lines[index][0])
            result = true;
            break;
        }
    }

    return result;
}

const installAndImportDistro = async() => {

    let localDistroVersion = "1.0.0"
    try {
        localDistroVersion = await getDatsDistroVersion();
    } catch (error) {
        console.log('distro not found.')
    }
    const version = await rest.getDistroVersion(1, localDistroVersion);
    if (!version.data.upToDate) {
        distroUrl = version.data.link;
        console.log(distroUrl);
    }

    if (distroUrl.trim().length == 0) {
        throw new Error('Version update link was not found.');
    }

    if (!fs.existsSync(distroPath)) {
        await execute.execCommand(commands, 4);
    }
    await downloadDistro(distroUrl);
    await execute.runCommandPromise(commands, 5);
    await execute.runCommandPromise(commands, 6);
    await execute.runCommandPromise(commands, 7);
}

const downloadDistro = async(url) => {
    const downloadStatus = await downloadFile(url, distroFilePath)
    console.log(downloadStatus ? "Download completed." : "Download failed.");
    downloadStatus ? log.logInfo("Download distro completed.") : log.logError("Download distro failed.");
}

const datsDistroSetDefault = async() => {
    let result = false;
    const output = await execute.runCommandError(commands, 7);
    if (output.includes('##SUCCESS##')) {
        result = true;
    }
    return result;
}

const checkWslDistroVersion = async() => {

    let result = false;

    const output = await execute.runCommandPromise(commands, 8);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    //console.log('checkWslDistroVersion output:', lines);

    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("dats-distro") && lines[index][0].includes("2")) {
            //console.log('line:', lines[index][0])
            result = true;
            break;
        }
    }

    return result;
}

const setWslDistroVersion = async() => {

    let result = false;

    const output = await execute.runCommandPromise(commands, 9);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    //console.log('setWslDistroVersion output:', lines);


    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("Conversion complete")) {
            //console.log('line:', lines[index][0])
            result = true;
            break;
        }
    }


    return result;
}

const checkDatsDistroVersion = async() => {

    let result = false;

    const output = await execute.runCommandPromise(commands, 10);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    //console.log('checkDatsDistroVersion output:', lines);

    const localDistroVersion = lines[0][0];
    let remoteDistroVersion = localDistroVersion;
    const checkVersion = await rest.getDistroVersion(1, localDistroVersion);
    if (checkVersion.status != 200) {
        throw new Error(`Distro version control error, status: ${checkVersion.status}`);
    }

    if (!checkVersion.data.upToDate) {
        remoteDistroVersion = checkVersion.data.latestVersion;
        distroUrl = checkVersion.data.link;
        //console.log(`distro url: ${distroUrl}`);
    }

    if (localDistroVersion == remoteDistroVersion) {
        result = true;
    }

    return result;
}

const unregisterDatsDistro = async() => {

    let result = false;

    const output = await execute.runCommandPromise(commands, 11);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    //console.log('unregisterDatsDistro output:', lines);


    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("Unregistering...")) {
            //console.log('line:', lines[index][0])
            result = true;
            break;
        }
    }

    return result;
}

const checkDatsDistroRunning = async() => {

    let result = false;

    const output = await execute.runCommandPromise(commands, 12);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    //console.log('checkDatsDistroRunning output:', lines);


    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("dats-distro")) {
            //console.log('line:', lines[index][0])
            result = true;
            break;
        }
    }

    return result;
}

const runDatsDistro = async() => {
    let result = false;

    const output = await execute.runCommandPromise(commands, 13);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    //console.log('runDatsDistro output:', lines);


    for (let index = 0; index < lines.length; index++) {

        if (lines[index][0].includes("test")) {
            //console.log('line:', lines[index][0])
            result = true;
            break;
        }
    }

    return result;
}

const runDatsSniffer = async(ip, port, attackId, timeout) => {
    await execute.runCommandPromise(commands, 19);

    const cmd = [{ command: 'powershell.exe', args: ['wsl', `datssniffer -ip ${ip} -p ${port} -a ${attackId} -t ${timeout}`] }];
    return await execute.runProcess(cmd, 0);
}

const runDatsWatcher = async(interfaceName, attackId, timeout) => {
    await execute.runCommandPromise(commands, 18);

    const cmd = [{ command: 'powershell.exe', args: ['wsl', `datswatcher -i ${interfaceName} -a ${attackId} -t ${timeout}`] }];
    return await execute.runProcess(cmd, 0);
}

const streamDatsWatcherLog = (publishObj, onSendMqtt) => {

    return new Promise((resolve, reject) => {
        const { command, args } = commands[15];
        const child = spawn(command, args);
        let counter = 0;
        let output = '';

        //console.log(`${command} ${args.join(' ')} pid: ${child.pid}`);

        child.stdout.setEncoding('utf-8');
        child.stdout.on('data', (data) => {

            try {
                if ((counter % 5) == 0) {
                    output += data.toString();
                    //console.log(`stdout from ${command}: ${data}`);
                    //log.logInfo(`stream watcher data: ${data.toString()}`);
                    const watcherData = JSON.parse(data.toString());
                    if (watcherData.attack_id == publishObj.attackId) {
                        publishObj.bandWidth = watcherData.send_bandwidth;
                        onSendMqtt('userdatacollector', 0, JSON.stringify(publishObj));
                        log.logInfo(`Sended attack data: ${JSON.stringify(publishObj)}`);
                    }
                }
                counter++;
            } catch (error) {
                log.logError(`stream watcher error. ${error.message}`);
            }
        });

        child.stderr.setEncoding('utf-8');
        child.stderr.on('data', (data) => {
            //console.error(`stderr from ${command}: ${data}`);
            reject(`stderr from ${command}: ${data}`);
        });

        child.stdout.on('end', () => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] the end.`);
        });

        child.on('close', (code) => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] close with code ${code}`);
        });


        child.on('exit', (code, signal) => {
            if (code === 0) {
                // The command was successful, so execute the next command
                //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] exited with code ${code}`);
            } else {
                // The command failed, so stop executing commands
                //console.error(`Command [${command} ${args.join(' ')} pid: ${child.pid}] failed with exit code ${code}, signal ${signal}.`);
                reject(`Command [${command} ${args.join(' ')} pid: ${child.pid}] failed with exit code ${code}.`);
            }
        });

        resolve(child);
    });

}

const readDatsSnifferOutput = async() => {
    return await execute.runCommandPromise(commands, 17);
}

const writeDatsHpingConfigtoFile = async(attackId, options) => {
    const configFilePath = `\\\\wsl$\\dats-distro/etc/dats/dats.cfg`;
    const cmd = [{ command: 'echo', args: [`${attackId} > "${configFilePath}" && echo ${options} >> "${configFilePath}"`] }];
    return await execute.execCommand(cmd, 0);
}

const killTailProcess = async() => {
    return await execute.runCommandPromise(commands, 16);
}

const killDatsProcess = async() => {
    return await execute.runCommandPromise(commands, 20);
}
const runDatsHping = async(attackId, options) => {

    try {
        await writeDatsHpingConfigtoFile(attackId, options);
        return await execute.runProcess(commands, 14);
    } catch (error) {
        log.logError(`runDatsHping error: ${error}`);
    }

}

const getDatsDistroVersion = async() => {
    const output = await execute.runCommandPromise(commands, 10);
    const lines = output.split('\n').map(v => v.replace(/\u0000/g, ''))
        .map(v => {
            while (v.replace(/\s\s/g, ' ') != v)
                v = v.replace(/\s\s/g, ' ').trim();
            return v;
        })
        .filter(v => v)
        .map(v => v.split('\r\n'));

    //console.log('checkDatsDistroVersion output:', lines);

    return lines[0][0];
}


module.exports = {
    start,
    runDatsSniffer,
    runDatsWatcher,
    runDatsHping,
    streamDatsWatcherLog,
    killTailProcess,
    killDatsProcess,
    readDatsSnifferOutput,
    getDatsDistroVersion,
    unregisterDatsDistro
}