const { exec, spawn, execFile } = require('child_process');


const runProcess = (commands, index = 0) => {

    return new Promise((resolve, reject) => {
        const { command, args } = commands[index];

        const child = spawn(command, args);

        //console.log(`${command} ${args.join(' ')} pid: ${child.pid}`);

        child.stdout.setEncoding('utf-8');
        child.stdout.on('data', (data) => {
            //console.log(`stdout from ${command}: ${data}`);
        });

        child.stderr.setEncoding('utf-8');
        child.stderr.on('data', (data) => {
            //console.error(`stderr from ${command}: ${data}`);
        });

        child.stdout.on('end', () => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] the end.`);
        });

        child.on('close', (code) => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] close with code ${code}`);
        });


        child.on('exit', (code) => {
            if (code === 0) {
                // The command was successful, so execute the next command
                //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] exited with code ${code}`);
            } else {
                // The command failed, so stop executing commands
                //console.error(`Command [${command} ${args.join(' ')} pid: ${child.pid}] failed with exit code ${code}.`);
                reject(new Error(`index: ${index}, command ${command} failed with exit code ${code}.`));
            }
        });

        resolve(child);

    });
}

const runCommandLive = (commands, index = 0) => {

    return new Promise((resolve, reject) => {
        const { command, args } = commands[index];

        const child = spawn(command, args);

        // console.log(`${command} ${args.join(' ')} pid: ${child.pid}`);

        child.stdout.setEncoding('utf-8');
        child.stdout.on('data', (data) => {
            //console.log(`stdout from ${command}: ${data}`);
            resolve(data.toString());
        });

        child.stderr.setEncoding('utf-8');
        child.stderr.on('data', (data) => {
            //console.error(`stderr from ${command}: ${data}`);
        });

        child.stdout.on('end', () => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] the end.`);
        });

        child.on('close', (code) => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] close with code ${code}`);
        });


        child.on('exit', (code) => {
            if (code === 0) {
                // The command was successful, so execute the next command
                //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] exited with code ${code}`);
            } else {
                // The command failed, so stop executing commands
                //console.error(`Command [${command} ${args.join(' ')} pid: ${child.pid}] failed with exit code ${code}.`);
                reject(new Error(`index: ${index}, command ${command} failed with exit code ${code}.`));
            }
        });

    });
}

const runCommandPromise = (commands, index = 0) => {

    return new Promise((resolve, reject) => {
        let output = '';

        const { command, args } = commands[index];

        const child = spawn(command, args);

        //console.log(`${command} ${args.join(' ')} pid: ${child.pid}`);

        child.stdout.setEncoding('utf-8');
        child.stdout.on('data', (data) => {
            //console.log(`stdout from ${command}: ${data}`);
            output += data.toString();
        });

        child.stderr.setEncoding('utf-8');
        child.stderr.on('data', (data) => {
            //console.error(`stderr from ${command}: ${data}`);
        });

        child.stdout.on('end', () => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] the end.`);
        });

        child.on('close', (code) => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] close with code ${code}`);
        });

        child.on('exit', (code) => {
            if (code === 0) {
                // The command was successful, so execute the next command
                //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] exited with code ${code}`);
                resolve(output);
            } else {
                // The command failed, so stop executing commands
                //console.error(`Command [${command} ${args.join(' ')} pid: ${child.pid}] failed with exit code ${code}.`);
                reject(new Error(`index: ${index}, command ${command} failed with exit code ${code}.`));
            }
        });

    });
}

const runCommandError = (commands, index = 0) => {

    return new Promise((resolve, reject) => {
        let output = '';

        const { command, args } = commands[index];

        const child = spawn(command, args);

        //console.log(`${command} ${args.join(' ')} pid: ${child.pid}`);

        child.stdout.setEncoding('utf-8');
        child.stdout.on('data', (data) => {
            //console.log(`stdout from ${command}: ${data}`);
            output += data.toString();
        });

        child.stderr.setEncoding('utf-8');
        child.stderr.on('data', (data) => {
            //console.error(`stderr from ${command}: ${data}`);
            resolve('##ERROR## ' + output);
        });

        child.stdout.on('end', () => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] the end.`);
        });

        child.on('close', (code) => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] close with code ${code}`);
        });


        child.on('exit', (code) => {
            if (code === 0 || code === 3010) {
                // The command was successful, so execute the next command
                //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] exited with code ${code}`);
                resolve('##SUCCESS## ' + output);
            } else {
                // The command failed, so stop executing commands
                //console.error(`Command [${command} ${args.join(' ')} pid: ${child.pid}] failed with exit code ${code}.`);
                reject(new Error(`index: ${index}, command [${command} ${args.join(' ')} pid: ${child.pid}] failed with exit code ${code}.`));
            }
        });

    });
}

const execCommand = (commands, index = 0) => {
    return new Promise((resolve, reject) => {
        let output = '';
        const { command, args } = commands[index];

        //console.log(`command: ${command} ${args.join(' ')}`);

        const child = exec(`${command} ${args.join(' ')}`);

        child.stdout.setEncoding('utf-8');
        child.stdout.on('data', (data) => {
            //console.log(`stdout from ${command}: ${data}`);
            output += data.toString();
        });

        child.stderr.setEncoding('utf-8');
        child.stderr.on('data', (data) => {
            //console.error(`stderr from ${command}: ${data}`);
            resolve('##ERROR## ' + output);
        });

        child.stdout.on('end', () => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] the end.`);
        });

        child.on('close', (code) => {
            //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}]  close with code ${code}`);
            //resolve(output);
        });


        child.on('exit', (code) => {
            if (code === 0) {
                // The command was successful, so execute the next command
                //console.log(`child process [${command} ${args.join(' ')} pid: ${child.pid}] exited with code ${code}`);
                resolve('##SUCCESS## ' + output);
            } else {
                // The command failed, so stop executing commands
                //console.error(`Command [${command} ${args.join(' ')} pid: ${child.pid}] failed with exit code ${code}.`);
                reject(new Error(`index: ${index}, command [${command} ${args.join(' ')} pid: ${child.pid}] failed with exit code ${code}.`));
            }
        });
    })
}

const execFileCommand = (filePath, params) => {
    return new Promise((resolve, reject) => {
        let output = '';

        const child = execFile(filePath, params, {
            detached: true
        });

        child.stdout.setEncoding('utf-8');
        child.stdout.on('data', (data) => {
            //console.log(`stdout from ${data}`);
            resolve(data.toString());
        });

        child.stderr.setEncoding('utf-8');
        child.stderr.on('data', (data) => {
            //console.error(`stderr from:  ${data}`);
            resolve('##ERROR## ' + output);
        });

        child.stdout.on('end', () => {
            //console.log(`child process the end.`);
        });

        child.on('close', (code) => {
            //console.log(`child process close with code ${code}`);
        });


        child.on('exit', (code) => {
            if (code === 0) {
                // The command was successful, so execute the next command
                //console.log(`child process exited with code ${code}`);
                resolve('##SUCCESS## ' + output);
            } else {
                // The command failed, so stop executing commands
                //console.error(`Command  failed with exit code ${code}.`);
                reject(new Error(`command failed with exit code ${code}.`));
            }
        });
    })
}

const execFileCommandProcess = (filePath, params) => {
    return new Promise((resolve, reject) => {
        let output = '';

        const child = execFile(filePath, params, {
            detached: true
        });

        child.stdout.setEncoding('utf-8');
        child.stdout.on('data', (data) => {
            console.log(`stdout from ${data}`);
            //resolve(data.toString());
        });

        child.stderr.setEncoding('utf-8');
        child.stderr.on('data', (data) => {
            //console.error(`stderr from:  ${data}`);
            resolve('##ERROR## ' + output);
        });

        child.stdout.on('end', () => {
            //console.log(`child process the end.`);
        });

        child.on('close', (code) => {
            //console.log(`child process close with code ${code}`);
        });


        child.on('exit', (code) => {
            if (code === 0) {
                // The command was successful, so execute the next command
                console.log(`child process exited with code ${code}`);
                //resolve('##SUCCESS## ' + output);
            } else {
                // The command failed, so stop executing commands
                //console.error(`Command  failed with exit code ${code}.`);
                reject(new Error(`command failed with exit code ${code}.`));
            }
        });

        resolve(child);
    })
}

module.exports = {
    runProcess,
    runCommandLive,
    runCommandPromise,
    runCommandError,
    execCommand,
    execFileCommand,
    execFileCommandProcess
}