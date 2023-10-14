import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import {
    configureChains,
    createConfig,
    createStorage,
    getAccount,
    getNetwork,
    getContract,
    connect,
    disconnect,
    watchAccount,
    watchNetwork,
    readContract,
    readContracts,
    getWalletClient,
    writeContract
} from '@wagmi/core'
import { bsc, zetachainAthensTestnet } from '@wagmi/core/chains'
//import { shardeumDappSphinx } from './shardeumDappsSphinx'
import { opBNB } from './opBNB.js'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'

const bscContractAddress = "0x213f2D530e983897f52993B89d70e60cDDe91b0e";
const shardeumContractAdddress = "0xB42fC442857CF83a9dE80a74bB5865214fDc2ECd";
const zetaContractAddress = "0x6A907532d057daD23dD34df76ed571f76f85aeCE";
let contractAbi = null;
let connectedAccount;

const connectButton = document.getElementById("connectToMetamask");
const disconnectButton = document.getElementById("logout");
const connectedProfile = document.getElementById("connectedProfile");
const accountAddressText = document.getElementById("accountAddress");

const supportedChains = [bsc, zetachainAthensTestnet, opBNB]
const projectId = '2e2ac30e296df0ca93e38edd314c6914'
let selectedNetwork = null;
let selectedChain = null;

const chainList = [
    { id: 56, contractAddress: "0x213f2D530e983897f52993B89d70e60cDDe91b0e", abiPath: "/pages/bsc-contract-abi.json" },
    { id: 7001, contractAddress: "0x6A907532d057daD23dD34df76ed571f76f85aeCE", abiPath: "/pages/zeta-contract-abi.json" },
    { id: 204, contractAddress: "0xC91Bf6014937338C53c32562e81F5F9aa52C6741", abiPath: "/pages/opbnb-contract-abi.json" },
    //{ id: 8082, contractAddress: "0xB42fC442857CF83a9dE80a74bB5865214fDc2ECd", abiPath: "/pages/shardeum-contract-abi.json" }
]

const { publicClient } = configureChains(supportedChains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
    autoConnect: true,
    //connectors: w3mConnectors({ projectId, chains }),
    connectors: [
        new WalletConnectConnector({
            supportedChains,
            options: {
                projectId: projectId,
                metadata: {
                    name: 'DatsProject Dapp',
                    description: 'Dats Project Desktop Dapp',
                    url: 'https://datsproject.io',
                    icons: ["https://datsproject.io/wp-content/uploads/2022/02/cropped-2-01-32x32.png"]
                }
            },
        }),
    ],
    storage: createStorage({ storage: window.localStorage }),
    publicClient
})

const onConnect = async() => {
    // await web3modal.openModal();
    const result = await connect({
        connector: new WalletConnectConnector({
            supportedChains,
            options: {
                projectId: projectId,
                metadata: {
                    name: 'DatsProject Dapp',
                    description: 'Dats Project Desktop Dapp',
                    url: 'https://datsproject.io',
                    icons: ["https://datsproject.io/wp-content/uploads/2022/02/cropped-2-01-32x32.png"]
                }
            },
        }),
    });

    console.log("result: ", result);
    await onLoad();
    // connectedAccount = result.account;
    // accountAddressText.innerHTML = `${result.account.substring(0,10)}..........${result.account.slice(-10)}`;

    // connectButton.classList.add('d-none');
    // connectedProfile.classList.remove('d-none');
}

const onDisconnect = async() => {
    await disconnect();
    store.remove("connectedAccount");
    window.location.reload();
}

const onLoad = async() => {
    const accounts = getAccount();
    console.log('accounts: ', accounts);
    if (accounts.address) {
        connectedAccount = accounts.address;
        window.account = connectedAccount;

        accountAddressText.innerHTML = `${connectedAccount.substring(0,10)}..........${connectedAccount.slice(-10)}`;

        connectButton.classList.add('d-none');
        connectedProfile.classList.remove('d-none');

        mqttRegister();

    } else {
        window.account = undefined;
        connectButton.click();
    }
}

const unwatchAccount = watchAccount((account) => console.log('switchAccount: ', account))
const unwatchNetwork = watchNetwork((network) => {
    selectedNetwork = network;
    console.log('switchNetwork: ', selectedNetwork);
})

const checkSupportedChain = () => {
    const findChain = chainList.find(({ id }) => id === selectedNetwork.chain.id);
    if (!findChain) {
        savedErrorNotify(`
                            Unsupported network. <br> <br>

                            Supported Networks
                            <ul>
                                <li>BNB Smart Chain Mainnet</li>
                                <li>ZetaChain Athens-3 Testnet</li>
                                <li>opBNB Mainnet</li>
                            </ul>
                            
                        `);
        return false;
    }

    return true;
}

window.addEventListener('load', async() => {

    connectButton.classList.remove('d-none');
    connectedProfile.classList.add('d-none');

    connectButton.addEventListener("click", onConnect);
    disconnectButton.addEventListener("click", onDisconnect);

    await onLoad();

    const { chain, chains } = getNetwork();
    console.log('chain: ', chain);
    console.log('chains: ', chains);
    console.log('selectedNetwork: ', selectedNetwork);

    console.log(supportedChains.find(({ id }) => id === chain.id));

    selectedChain = chainList.find(({ id }) => id === chain.id);
    console.log('selectedChain: ', selectedChain);
    if (!selectedChain) {
        savedErrorNotify(`
                            Unsupported network. <br> <br>

                            Supported Networks
                            <ul>
                                <li>BNB Smart Chain Mainnet</li>
                                <li>ZetaChain Athens-3 Testnet</li>
                                <li>opBNB Mainnet</li>
                            </ul>
                            
                        `);
        return false;
    }



    contractAbi = await fetch(selectedChain.abiPath).then((response) => response.json());
    console.log(contractAbi);

    if (location.href.includes('ddos')) {

        let policyBandwidth = 0;

        try {
            // const contract = await getContract({
            //   address: contractAddress,
            //   abi: contractAbi
            // })

            // console.log('contract: ', contract);

            const ddosData = await readContract({
                address: selectedChain.contractAddress,
                abi: contractAbi,
                functionName: 'getDDos',
                account: connectedAccount
            });
            console.log('ddosData: ', ddosData);

            if (process.platform === 'win32') {
                policyBandwidth = await childProcess.getPolicyBandwidth();
                console.log(policyBandwidth, typeof policyBandwidth);
                console.log(ddosData.trafficScale, typeof ddosData.trafficScale);
            }

            if (ddosData.user == connectedAccount) {
                if (policyBandwidth > 0 && policyBandwidth !== ddosData.trafficScale) {
                    await childProcess.setPolicy(ddosData.trafficScale);
                }

                document.getElementById('approveDdosService').checked = ddosData.isApprove;
                document.getElementById('rangeMbit').value = ddosData.trafficScale;
                showRangeValue(ddosData.trafficScale);
            }
        } catch (error) {
            console.log(`Get DDos settings from contract error, ${error.message}`);
            log.logError(`Get DDos settings from contract error, ${error.message}`);
        }

        document.getElementById("saveDdos").addEventListener('click', async() => {

            if (!checkSupportedChain()) {
                return false;
            }

            try {
                await saveDDos(document.getElementById('approveDdosService').checked, document.getElementById('rangeMbit').value, (saveBtn, processingBtn) => {
                    savedSuccessNotify();
                    if (process.platform === 'win32') ipcRenderer.send("policy", parseInt(document.getElementById('rangeMbit').value));
                    saveBtn.classList.remove("d-none");
                    processingBtn.classList.add("d-none");
                    log.logInfo(`DDos settings saved successfully. Approve: ${document.getElementById('approveDdosService').checked}, TrafficScale: ${document.getElementById('rangeMbit').value}`);
                });
            } catch (error) {
                console.log(error);
                log.logError(`Save DDos settings to contract error. ${error.message}`);
            }
        });
    }


    if (location.href.includes('super')) {
        try {
            const superData = await readContract({
                address: selectedChain.contractAddress,
                abi: contractAbi,
                functionName: 'getSuperComputer',
                account: connectedAccount
            });
            console.log('superData: ', superData);

            if (superData.user == connectedAccount) {
                document.getElementById('approveSuperComputer').checked = superData.isApprove;
                document.getElementById('rangeCpu').value = superData.cpuValue;
                showCpuRangeValue(superData.cpuValue);
            }
        } catch (error) {
            console.log(`Get super computer settings from contract error, ${error.message}`);
            log.logError(`Get super computer settings from contract error, ${error.message}`);
        }

        document.getElementById("saveSuperComputer").addEventListener('click', async() => {
            try {

                if (!checkSupportedChain()) {
                    return false;
                }

                await saveSuperComputer(document.getElementById('approveSuperComputer').checked, document.getElementById('rangeCpu').value, (saveBtn, processingBtn) => {
                    savedSuccessNotify();
                    saveBtn.classList.remove("d-none");
                    processingBtn.classList.add("d-none");
                    log.logInfo(`Super Computer settings saved successfully. Approve: ${document.getElementById('approveSuperComputer').checked}, 
                                                                   CpuValue: ${document.getElementById('rangeCpu').value}`);
                });
            } catch (error) {
                console.log(error);
                log.logError(`Save Super Computer settings to contract error. ${error.message}`);
            }
        })

    }

    if (location.href.includes('cyber')) {

        try {
            const cyberData = await readContract({
                address: selectedChain.contractAddress,
                abi: contractAbi,
                functionName: 'getCyberSecurity',
                account: connectedAccount
            });
            console.log('cyberData: ', cyberData);

            if (cyberData.user == connectedAccount) {
                document.getElementById('switchApproveCyberSecurityResearch').checked = cyberData.isApprove;
                document.getElementById("chkWebSecurity").checked = cyberData.webSecurity;
                document.getElementById("chkServerSecurity").checked = cyberData.serverSecurity;
                document.getElementById("chkRansomwareResearch").checked = cyberData.ransomwareResearch;
                document.getElementById("chkMalwareResearch").checked = cyberData.malwareResearch;
            }
        } catch (error) {
            console.log(`Get cyber security research settings from contract error, ${error.message}`);
            log.logError(`Get cyber security research settings from contract error, ${error.message}`);
        }

        document.getElementById("saveCyber").addEventListener('click', async() => {
            try {

                if (!checkSupportedChain()) {
                    return false;
                }

                await saveCyber(
                    document.getElementById('switchApproveCyberSecurityResearch').checked,
                    document.getElementById("chkWebSecurity").checked,
                    document.getElementById("chkServerSecurity").checked,
                    document.getElementById("chkRansomwareResearch").checked,
                    document.getElementById("chkMalwareResearch").checked,
                    (saveBtn, processingBtn) => {
                        savedSuccessNotify();
                        saveBtn.classList.remove("d-none");
                        processingBtn.classList.add("d-none");
                        log.logInfo(`Cyber Security Research settings saved successfully. Approve: ${document.getElementById('switchApproveCyberSecurityResearch').checked}, 
                                                                            WebSecurity: ${document.getElementById("chkWebSecurity").checked}, 
                                                                            ServerSecurity: ${document.getElementById("chkServerSecurity").checked}, 
                                                                            RansomwareResearch: ${document.getElementById("chkRansomwareResearch").checked},
                                                                            MalwareResearch: ${document.getElementById("chkMalwareResearch").checked}`);
                    });
            } catch (error) {
                console.log(error);
                log.logError(`Save cyber security research settings to contract error. ${error.message}`);
            }
        });
    }

    if (location.href.includes('vulnerability')) {

        try {
            const vulnerabilityData = await readContract({
                address: selectedChain.contractAddress,
                abi: contractAbi,
                functionName: 'getVulnerability',
                account: connectedAccount
            });
            console.log('vulnerabilityData: ', vulnerabilityData);

            if (vulnerabilityData.user == connectedAccount) {
                document.getElementById('switchApproveVulnerability').checked = vulnerabilityData.isApprove;
                document.getElementById("chkWebPenetration").checked = vulnerabilityData.webPenetration;
                document.getElementById("chkServerPenetration").checked = vulnerabilityData.serverPenetration;
                document.getElementById("chkScadaPenetration").checked = vulnerabilityData.scadaPenetration;
                document.getElementById("chkBlockchainPenetration").checked = vulnerabilityData.blockchainPenetration;
                document.getElementById("chkContractPenetration").checked = vulnerabilityData.contractPenetration;
            }
        } catch (error) {
            console.log(`Get vulnerability settings from contract error, ${error.message}`);
            log.logError(`Get vulnerability settings from contract error, ${error.message}`);
        }

        document.getElementById("saveVulnerability").addEventListener('click', async() => {
            try {

                if (!checkSupportedChain()) {
                    return false;
                }

                await saveVulnerability(
                    document.getElementById('switchApproveVulnerability').checked,
                    document.getElementById("chkWebPenetration").checked,
                    document.getElementById("chkServerPenetration").checked,
                    document.getElementById("chkScadaPenetration").checked,
                    document.getElementById("chkBlockchainPenetration").checked,
                    document.getElementById("chkContractPenetration").checked,
                    (saveBtn, processingBtn) => {
                        savedSuccessNotify();
                        saveBtn.classList.remove("d-none");
                        processingBtn.classList.add("d-none");
                        log.logInfo(`Vulnerability settings saved successfully. Approve: ${document.getElementById('switchApproveVulnerability').checked}, 
                                                                            WebPenetration: ${document.getElementById("chkWebPenetration").checked}, 
                                                                            ServerPenetration: ${document.getElementById("chkServerPenetration").checked}, 
                                                                            ScadaPenetration: ${document.getElementById("chkScadaPenetration").checked},
                                                                            BlockchainPenetration: ${document.getElementById("chkBlockchainPenetration").checked},
                                                                            ContractPenetration: ${document.getElementById("chkContractPenetration").checked}`);
                    });
            } catch (error) {
                console.log(error);
                log.logError(`Save vulnerability settings to contract error. ${error.message}`);
            }
        });
    }

    if (location.href.includes('blockchain')) {
        try {
            const blockchainData = await readContract({
                address: selectedChain.contractAddress,
                abi: contractAbi,
                functionName: 'getBlockchain',
                account: connectedAccount
            });
            console.log('blockchainData: ', blockchainData);

            if (blockchainData.user == connectedAccount) {
                document.getElementById('switchApproveAttackPrevention').checked = blockchainData.approveAttackPrevention;
            }
        } catch (error) {
            console.log(`Get blockchain settings from contract error, ${error.message}`);
            log.logError(`Get blockchain settings from contract error, ${error.message}`);
        }

        document.getElementById("saveBlockchain").addEventListener('click', async() => {
            try {

                if (!checkSupportedChain()) {
                    return false;
                }

                await saveBlockchain(
                    document.getElementById('switchApproveAttackPrevention').checked,
                    (saveBtn, processingBtn) => {
                        savedSuccessNotify();
                        saveBtn.classList.remove("d-none");
                        processingBtn.classList.add("d-none");
                        log.logInfo(`Blockchain settings saved successfully. ApproveAttackPrevention: ${document.getElementById('switchApproveAttackPrevention').checked}`);
                    });
            } catch (error) {
                console.log(error);
                log.logError(`Save vulnerability settings to contract error. ${error.message}`);
            }
        });
    }

});

async function saveDDos(isApprove, trafficScale, callback) {

    contractAbi = await fetch(selectedChain.abiPath).then((response) => response.json());

    document.getElementById("saveDdos").classList.add("d-none");
    document.getElementById('processingDdos').classList.remove("d-none");

    setTimeout(async() => {
        try {
            const { hash } = await writeContract({
                address: selectedChain.contractAddress,
                abi: contractAbi,
                functionName: 'saveDDos',
                args: [isApprove, trafficScale],
            })
            console.log('hash: ', hash);
            callback(document.getElementById("saveDdos"), document.getElementById('processingDdos'));

        } catch (error) {
            savedErrorNotify(error.message);
            //ipcRenderer.send("policy", "policy test");
            document.getElementById("saveDdos").classList.remove("d-none");
            document.getElementById('processingDdos').classList.add("d-none");
        }
    }, 1000);

}

async function saveSuperComputer(isApprove, cpuValue, callback) {

    contractAbi = await fetch(selectedChain.abiPath).then((response) => response.json());

    document.getElementById("saveSuperComputer").classList.add("d-none");
    document.getElementById('processingSuperComputer').classList.remove("d-none");

    setTimeout(async() => {

        try {
            const { hash } = await writeContract({
                address: selectedChain.contractAddress,
                abi: contractAbi,
                functionName: 'saveSuperComputer',
                args: [isApprove, cpuValue],
            })
            console.log('hash: ', hash);
            callback(document.getElementById("saveSuperComputer"), document.getElementById('processingSuperComputer'));
        } catch (error) {
            savedErrorNotify(error.message);
            document.getElementById("saveSuperComputer").classList.remove("d-none");
            document.getElementById('processingSuperComputer').classList.add("d-none");
        }

    }, 1000);
}

async function saveCyber(isApprove, webSecurity, serverSecurity, ransomwareResearch, malwareResearch, callback) {

    contractAbi = await fetch(selectedChain.abiPath).then((response) => response.json());

    document.getElementById("saveCyber").classList.add("d-none");
    document.getElementById("processingCyber").classList.remove("d-none");

    setTimeout(async() => {
        const { hash } = await writeContract({
            address: selectedChain.contractAddress,
            abi: contractAbi,
            functionName: 'saveCyberSecurity',
            args: [isApprove, webSecurity, serverSecurity, ransomwareResearch, malwareResearch],
        })
        console.log('hash: ', hash);
        callback(document.getElementById("saveCyber"), document.getElementById("processingCyber"));
    }, 1000);
}

async function saveVulnerability(isApprove, webPenetration, serverPenetration, scadaPenetration, blockchainPenetration, contractPenetration, callback) {

    contractAbi = await fetch(selectedChain.abiPath).then((response) => response.json());

    const saveVulnerabilityButton = document.getElementById("saveVulnerability");
    const processingVulnerabilityButton = document.getElementById('processingVulnerability');

    saveVulnerabilityButton.classList.add("d-none");
    processingVulnerabilityButton.classList.remove("d-none");

    setTimeout(async() => {
        const { hash } = await writeContract({
            address: selectedChain.contractAddress,
            abi: contractAbi,
            functionName: 'saveVulnerability',
            args: [isApprove, webPenetration, serverPenetration, scadaPenetration, blockchainPenetration, contractPenetration],
        })
        console.log('hash: ', hash);
        callback(saveVulnerabilityButton, processingVulnerabilityButton);
    }, 1000);
}

async function saveBlockchain(approveAttackPrevention, callback) {

    contractAbi = await fetch(selectedChain.abiPath).then((response) => response.json());

    const saveBlockchainButton = document.querySelector('#saveBlockchain');
    const processingBlockchainButton = document.querySelector('#processingBlockchain');

    saveBlockchainButton.classList.add("d-none");
    processingBlockchainButton.classList.remove("d-none");

    setTimeout(async() => {
        const { hash } = await writeContract({
            address: selectedChain.contractAddress,
            abi: contractAbi,
            functionName: 'saveBlockchain',
            args: [approveAttackPrevention],
        })
        console.log('hash: ', hash);
        callback(saveBlockchainButton, processingBlockchainButton);
    }, 1000);
}

export { opBNB }