const axios = require('axios');
const https = require('https');
require('dotenv').config();

const MIDDLEWARE_URL = "https://middleware.datsproject.io/api/users/contract";
const REGISTER_MQTT_URL = "https://middleware.datsproject.io/api/users/message-broker/register/";
const VCS_URL = "https://vcs.datsproject.io/";
const REPORT_URL = "https://report.datsproject.io/";

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json'
    },
    httpsAgent: new https.Agent({ keepAlive: true }),
    timeout: 60000
};


const getExternalIpAddress = async() => {
    const url = 'http://api.ipify.org/';
    const response = await axios.get(url);
    return response.data;
}

const getGeolocationInfoByIpAddress = async(ipAddress) => {
    const url = `https://api.ipstack.com/${ipAddress}?access_key=417f2215f02f36422140776c9ea6fe3e`;
    const response = await axios.get(url, axiosConfig);
    return response.data;
}

const getAddressesFromContract = (walletAddress) => {

    return new Promise(async(resolve, reject) => {
        const config = {
            headers: {
                'x-api-key': `630a91dc-820a-4225-abe8-4966482e45a1`
            }
        };

        const response = await axios.get(MIDDLEWARE_URL, config);
        const ddoses = response.data;
        const result = ddoses.find(ddos => ddos.address === walletAddress.toString());
        resolve(result);
    })

}

const registerMqtt = async(account) => {

    const response = await axios.post(`${REGISTER_MQTT_URL}${account}`, {}, {
        headers: {
            'x-api-key': `630a91dc-820a-4225-abe8-4966482e45a1`
        }
    });

    return response.status;
}

const getDistroVersion = async(type, version) => {
    const config = {
        timeout: 30000
    }

    const data = {
        type: type,
        version: version
    }
    const response = await axios.post(`${VCS_URL}version_control`, data, axiosConfig);

    return {
        status: response.status,
        data: response.data
    }
}

const sendPacketCountData = async(obj) => {

    const response = await axios.post(`${REPORT_URL}collect`, obj, axiosConfig);
    return response.status;
}

const getTimeNow = async() => {
    const response = await axios.get('https://report.datsproject.io/time', axiosConfig);
    return response.data;
}

module.exports = {
    getExternalIpAddress,
    getGeolocationInfoByIpAddress,
    getAddressesFromContract,
    registerMqtt,
    getDistroVersion,
    sendPacketCountData,
    getTimeNow
}