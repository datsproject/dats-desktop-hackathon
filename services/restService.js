const axios = require('axios');
const https = require('https');
require('dotenv').config();

const MIDDLEWARE_URL = "https://middleware.datsproject.io/";
const REGISTER_MQTT_URL = "https://middleware.datsproject.io/api/users/message-broker/register/";
const VCS_URL = "https://vcs.datsproject.io/";
const REPORT_URL = "https://report.datsproject.io/";
const REFERRAL_URL = "https://referral.datsproject.io/";

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

        const response = await axios.get(`${MIDDLEWARE_URL}api/users/contract`, config);
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

const sendUpTime = async(obj) => {
    const config = {
        headers: {
            'x-api-key': `630a91dc-820a-4225-abe8-4966482e45a1`
        }
    };
    const response = await axios.post(`${MIDDLEWARE_URL}api/users/uptimes`, obj, config);
    return response.status;
}

const getAllUptimesForWallet = async(walletAddress) => {
    const config = {
        headers: {
            'x-api-key': `630a91dc-820a-4225-abe8-4966482e45a1`
        }
    };

    const response = await axios.get(`${MIDDLEWARE_URL}api/users/uptimes/all/${walletAddress}`, config);
    return response.data;
}

const getLastSpeedTest = async(account) => {

    const config = {
        headers: {
            'x-api-key': `630a91dc-820a-4225-abe8-4966482e45a1`
        }
    };

    const response = await axios.get(`${MIDDLEWARE_URL}api/users/last-bandwidth?walletAddress=${account}`, config);

    return response.data
}

const saveReferralCode = async(account, code, macAddress) => {
    const config = {
        headers: {
            'x-api-key': `b80f92b0-1b36-4572-b88f-81396b0abd68`
        }
    };

    const data = {
        owner: account,
        code: code,
        macAddress: macAddress
    }

    const response = await axios.post(`${REFERRAL_URL}api/referral`, data, config);

    return response.status;
}

const checkReferralCodeByWalletAddress = async(walletAddress) => {
    const config = {
        headers: {
            'x-api-key': `b80f92b0-1b36-4572-b88f-81396b0abd68`
        }
    };

    const response = await axios.get(`${REFERRAL_URL}api/referral?walletAddress=${walletAddress}`, config);

    return response.data
}

const getLeaderBoardByWalletAddress = async(walletAddress) => {
    const response = await axios.get(`${REPORT_URL}leader-board/all`, axiosConfig);
    return response.data;
}


module.exports = {
    getExternalIpAddress,
    getGeolocationInfoByIpAddress,
    getAddressesFromContract,
    registerMqtt,
    getDistroVersion,
    sendPacketCountData,
    getTimeNow,
    sendUpTime,
    getAllUptimesForWallet,
    getLastSpeedTest,
    saveReferralCode,
    checkReferralCodeByWalletAddress,
    getLeaderBoardByWalletAddress
}