const fs = require('fs');
const axios = require('axios');
const log = require('./log.js');
const path = require('path');
const FormData = require('form-data');
const directoryPath = process.platform === "win32" ? "C:\\Program Files\\Dats Project\\logs\\" : path.join(process.env.HOME, "Library", "Logs", "DatsProject");
//path.join(app.getAppPath(), 'logs');

const sendLog = (walletAddress) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            log.logError(`An error occurred while reading the log folder: ${err}`);
        } else {

            if (files.length > 0) {
                files.forEach((file) => {

                    if (file.startsWith('dats-log')) {
                        const filePath = path.join(directoryPath, file);

                        let formData = new FormData();

                        formData.append('wallet_address', walletAddress);
                        formData.append('file', fs.createReadStream(filePath));


                        let config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: 'https://report.datsproject.io/upload',
                            headers: {
                                ...formData.getHeaders()
                            },
                            data: formData
                        };

                        axios.request(config)
                            .then((response) => {
                                if (response.status == 200) {
                                    log.logInfo(`Log file sent successfully. ${file}`);
                                    console.log(`Log file sent successfully. ${file}`);
                                    fs.unlink(filePath, (err) => {
                                        if (err) {
                                            log.logError(`An error occurred while deleting the log file: ${file}, error: ${err}`);
                                            console.log(`An error occurred while deleting the log file: ${file}, error: ${err}`);
                                        }
                                    })
                                } else {
                                    console.log('response status: ', response.status);
                                }
                            })
                            .catch((error) => {
                                log.logError(`An error occurred while sending log files: ${error}`);
                                console.log(`An error occurred while sending log files: ${error}`);
                            });
                    }

                });

            }

        }
    });
}

module.exports = { sendLog }