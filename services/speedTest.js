const execute = require('./execute.js');
const path = require('path');

const runSpeedTest = async() => {

    /*
    if (process.platform !== 'darwin') {
        const commands = [
            { index: 0, command: 'wsl', args: ['datsspeedy', '--no-download', '--json'] }
        ]
        return await execute.runCommandPromise(commands, 0);
    } else {
        const filePath = path.join(__dirname, '../datsspeedy');
        const params = ['--no-download', '--json'];
        return await execute.execFileCommand(filePath, params);
    }

    */

    const filePath = process.platform === 'win32' ? './datsspeedy.exe' : path.join(__dirname, `../datsspeedy_${process.platform}`);
    const params = ['--no-download', '--json'];
    return await execute.execFileCommand(filePath, params);

}

module.exports = {
    runSpeedTest
}