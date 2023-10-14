const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

// Initialize electron-log
//log.transports.console.level = 'info';
log.transports.file.level = 'info';
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';


const logPath = process.platform === "win32" ? "C:\\Program Files\\Dats Project\\logs\\" : path.join(process.env.HOME, "Library", "Logs", "DatsProject");

//console.log('logpath: ', logPath);

if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}

log.transports.file.resolvePath = () => {
    const currentDate = moment().format('YYYY-MM-DD');
    return path.join(logPath, `dats-log-${currentDate}.log`);
};


const logInfo = (message) => {
    log.info(message);
}

const logError = (message) => {
    log.error(message);
}

const logWarning = (message) => {
    log.warn(message);
}

module.exports = {
    log,
    logInfo,
    logError,
    logWarning
}