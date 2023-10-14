const mqtt = remote.require('./services/MQTT.js');
const restService = remote.require('./services/restService.js');
const store = remote.require('./services/store.js');

const contractAddress = '0x213f2D530e983897f52993B89d70e60cDDe91b0e';
let contractAbi = null;

const connectButton = document.querySelector("#connectToMetamask");
const disconnectButton = document.querySelector("#logout");
const connectedProfile = document.querySelector("#connectedProfile");
const accountAddressText = document.querySelector("#accountAddress");

let accounts;
let selectedAccount;
let ethersProvider;
let signer;

console.log(MetaMaskSDK);

/*
const options = {
    forceInjectProvider: typeof window.ethereum === 'undefined',
    communicationLayerPreference: "socket",
    shouldShimWeb3: true,
    showQRCode: false,
    dappMetadata: {
        name: 'DatsProject Dapp',
        description: 'Dats Project Desktop Dapp',
        url: 'https://dapp.datsproject.io',
        icons: ['https://datsproject.io/wp-content/uploads/2022/02/cropped-2-01-32x32.png']
    }
}

*/

const options = {
    shouldShimWeb3: false,
    dappMetadata: {
        name: "DatsProject Dapp",
        url: window.location.host,
    },
    storage: {
        enabled: true,
    },
    logging: {
        sdk: false,
    }
};

const MMSDK = new MetaMaskSDK.MetaMaskSDK(options);
const ethereum = MMSDK.getProvider();

async function onConnect() {

    const accounts = await ethereum.request({
        method: "eth_requestAccounts",
        params: []
    });

    selectedAccount = accounts[0];

    ethersProvider = new ethers.providers.Web3Provider(ethereum, 56);
    signer = ethersProvider.getSigner();

    //const accounts = await ethersProvider.listAccounts();

    console.log(`Got accounts: ${accounts}`);
    log.logInfo(`Connected accounts with MetaMask: ${selectedAccount}`);

    connectButton.classList.add('d-none');
    connectedProfile.classList.remove('d-none');

    accountAddressText.innerHTML = `${selectedAccount.substring(0,10)}..........${selectedAccount.slice(-10)}`;

    console.log("store get: ",store.get("connectedAccount"));

    if (store.get("connectedAccount") == undefined) store.set("connectedAccount", selectedAccount);

    if (store.get("connectedAccount") != selectedAccount) {
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


    ethereum.on("chainChanged", function(networkId) {
        console.log('NetworkId: ', networkId);
        //window.location.reload();
    });

    ethereum.on("accountsChanged", (account) => {
        account = account;
        //window.location.reload();
        console.log('Account: ', account);
    });

    ethereum.on("disconnect", ()=>{
        console.log('Metamask disconnected.');
        onDisconnect();
    })
}

async function onDisconnect() {
    console.log(`Killing the wallet connection.`);
    
    accounts = null;
    selectedAccount = null;
    window.account = null;
    ethersProvider = null;
    signer = null;

    mqtt.onDisconnectMqtt();

    store.remove("connectedAccount");

    remote.getCurrentWindow().reload();
    
}

async function contract(contractAbi, contractAddress) {
    if (selectedAccount) {
        return new ethers.Contract(contractAddress, contractAbi, signer);
    } else {
        return false;
    }
}


window.addEventListener('load', async() => {
    connectButton.classList.remove('d-none');
    connectedProfile.classList.add('d-none');

    connectButton.addEventListener("click", onConnect);
    disconnectButton.addEventListener("click", onDisconnect);

    await onConnect();
});