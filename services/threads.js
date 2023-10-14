const { Worker } = require('worker_threads')

function getMaxThreadSize() {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`
      const { threadId } = require('worker_threads');
      threadId;
    `, { eval: true });

        worker.on('message', (threadId) => {
            resolve(threadId - 1);
        });

        worker.on('error', (error) => {
            reject(error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

async function run() {
    try {
        const maxThreadSize = await getMaxThreadSize();
        console.log('Max available thread size:', maxThreadSize);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

module.exports = {
    run
}