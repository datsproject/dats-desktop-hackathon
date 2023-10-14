const http = require('http');
const https = require('https');
const fs = require('fs');

const downloadFile = async(url, targetFile) => {
    const client = url.startsWith('https') ? https : http;

    return await new Promise((resolve, reject) => {

        client.get(url, (response) => {
            const code = (response.statusCode != null ? response.statusCode : 0);

            if (code >= 400) {
                return reject(new Error(response.statusMessage))
            }

            // handle redirects
            if (code > 300 && code < 400 && !!response.headers.location) {
                return resolve(
                    downloadFile(response.headers.location, targetFile)
                )
            }

            // save the file to disk
            const fileWriter = fs
                .createWriteStream(targetFile)
                .on('finish', () => {
                    resolve(true)
                })

            response.pipe(fileWriter)
        }).on('error', (err) => {
            fs.unlink(filePath, () => {
                reject(err);
            });
        });
    });
};

module.exports = {
    downloadFile
}