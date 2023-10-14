const { ethers } = require('ethers');
const mqtt = remote.require('./services/MQTT.js');
const restService = remote.require('./services/restService.js');
const store = remote.require('./services/store.js');
require('dotenv').config();

const contractAddress = '0x213f2D530e983897f52993B89d70e60cDDe91b0e'; //'0xFE809A2d316db1D4831Bd1340FB930075069Cda5'; 

let contractAbi = null; //JSON.parse(fs.readFileSync(path.join(__dirname, '/pages/contract-abi.json'), 'utf-8'));

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

const connectButton = document.querySelector("#connectToMetamask");
const disconnectButton = document.querySelector("#logout");
const connectedProfile = document.querySelector("#connectedProfile");
const accountAddressText = document.querySelector("#accountAddress");

let web3Modal;
let provider;
let ethersProvider;
let signer;
let selectedAccount;

const init = () => {

    connectButton.classList.remove('d-none');
    connectedProfile.classList.add('d-none');

    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                rpc: {
                    //8081: 'https://dapps.shardeum.org',
                    56: 'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3',
                    //97: 'https://data-seed-prebsc-1-s1.binance.org:8545'
                }
            }
        }
    };

    web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions,
        disableInjectedProvider: true,
        theme: 'dark'
    });

    //console.log(`Web3Modal instance is ${web3Modal}`);
}

const fetchAccountData = async() => {

    ethersProvider = new ethers.providers.Web3Provider(provider);
    signer = ethersProvider.getSigner();

    //const web3 = new Web3(provider);

    //console.log(`Web3 instance is ${ethersProvider}`);

    // console.log(ethersProvider);
    // console.log(signer);

    const accounts = await ethersProvider.listAccounts();

    console.log(`Got accounts: ${accounts}`);
    log.logInfo(`Connected accounts with MetaMask: ${accounts[0]}`);

    accountAddressText.innerHTML = `${accounts[0].substring(0,10)}..........${accounts[0].slice(-10)}`;

    if (store.get("connectedAccount") == undefined) store.set("connectedAccount", accounts[0]);

    if (store.get("connectedAccount") != accounts[0]) {
        Lobibox.notify('warning', {
            icon: 'bx bx-error-circle',
            delay: false,
            delayIndicator: false,
            position: 'center top',
            size: 'mini',
            msg: 'You have logged in with an account that is not registered in the contract.'
        });
    }

    selectedAccount = store.get("connectedAccount") //accounts[0];
    window.account = selectedAccount;

    console.log(`connectedAccount: ${store.get("connectedAccount")}`);
    console.log('window.account: ', window.account);
    try {
        const registerStatus = await restService.registerMqtt(window.account);

        console.log(registerStatus);
        if (registerStatus == 200) {
            log.logInfo(`Emqx client registration completed successfully. clientId: ${window.account}`);
            mqtt.onConnectMqtt(window.account);
        } else {
            log.logError(`Client registration failed. status: ${registerStatus}`);
        }
    } catch (error) {
        log.logError(`Client registration exception. ${error.message}`);
    }


}

const refreshAccountData = async(provider) => {
    await fetchAccountData(provider);
}

const onConnect = async() => {
    console.log(`Opening a dialog ${web3Modal}`);
    try {
        provider = await web3Modal.connect();
        //provider = await web3Modal.connectTo('walletconnect')
    } catch (err) {
        console.log(`Could not get a wallet connection,  ${err}`);
        return false;
    }

    provider.on("accountsChanged", async(accounts) => {
        //checkAddressFromContract(accounts[0]);
        console.log(`account changed: ${accounts[0]}`);
        log.logInfo(`account changed: ${accounts[0]}`);
        fetchAccountData();
        remote.getCurrentWindow().reload();
    });

    provider.on("chainChanged", (chainId) => {
        console.log(`chain changed. chainId: ${chainId}`);
        fetchAccountData();
    });

    provider.on("networkChanged", (networkId) => {
        console.log("Provider NetworkChanged.");
        log.logInfo(`Provider NetworkChanged.`);
        fetchAccountData();
    });

    provider.on("disconnected", (code, reason) => {
        console.log(`Provider disconnected. code: ${code}, reason: ${reason}`);
    });

    await refreshAccountData(provider);

    connectButton.classList.add('d-none');
    connectedProfile.classList.remove('d-none');
}

const onDisconnect = async() => {
    console.log(`Killing the wallet connection ${provider}`);
    if (provider.close) {
        await provider.close();

        await web3Modal.clearCachedProvider();
        provider = null;
    }
    selectedAccount = null;
    window.account = null;

    mqtt.onDisconnectMqtt();

    store.remove("connectedAccount");

    remote.getCurrentWindow().reload();
}

const contract = async(contractAbi, contractAddress) => {
    if (selectedAccount) {
        return new ethers.Contract(contractAddress, contractAbi, signer);
    } else {
        return false;
    }
}

const checkAddressFromContract = (address) => {

    if (address.startsWith("0x")) {
        restService.getAddressesFromContract(address).then(result => {
            if (result == undefined) {
                alert(`
                    You have logged in with an address that is not registered in the contract.
                    Please switch to a registered account via mobile metamask.
                `)
            }
        });

    }
}

window.addEventListener('load', async() => {
    init();

    connectButton.addEventListener("click", onConnect);
    disconnectButton.addEventListener("click", onDisconnect);

    connectButton.click();
});