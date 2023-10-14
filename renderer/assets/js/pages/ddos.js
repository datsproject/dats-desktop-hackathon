const saveDdosButton = document.querySelector("#saveDdos");
const processingDdosButton = document.querySelector('#processingDdos');
const approveDdosServiceSwitch = document.querySelector("#approveDdosService");
const trafficScaleRangeInput = document.querySelector("#rangeMbit");
const selectedTrafficScaleRangeValueSpan = document.querySelector("#selectedMbitRangeValue");


//contractAbi = JSON.parse(fs.readFileSync(path.join(__dirname, 'contract-abi.json'), 'utf-8'));

webContents.on("did-finish-load", async() => {
    //await getDDos();
    console.log(ddosData)
});

const showRangeValue = (newValue) => {
    selectedTrafficScaleRangeValueSpan.innerHTML = `${newValue} mbit`;
}

async function saveDDos(isApprove, trafficScale, callback) {

    contractAbi = await fetch('/pages/contract-abi.json').then((response) => response.json());

    saveDdosButton.classList.add("d-none");
    processingDdosButton.classList.remove("d-none");

    const datsContract = await contract(contractAbi, contractAddress);

    const listener = (id, consumer, data) => {
        console.log(`id: ${id}, consumer: ${consumer}, data: ${data}`);
        log.logInfo(`id: ${id}, consumer: ${consumer}, data: ${data}`);
    }

    datsContract.on("DDosSaved", listener);

    setTimeout(async() => {
        try {
            await datsContract.saveDDos(isApprove, trafficScale);
            callback(saveDdosButton, processingDdosButton);

        } catch (error) {
            savedErrorNotify(error.message);
            //ipcRenderer.send("policy", "policy test");
            saveDdosButton.classList.remove("d-none");
            processingDdosButton.classList.add("d-none");
        }
    }, 1000);

}

async function getDDos() {

    contractAbi = await fetch('/pages/contract-abi.json').then((response) => response.json());

    setTimeout(async() => {
        try {
            const datsContract = await contract(contractAbi, contractAddress);
            const ddosData = await datsContract.getDDos();
            if (ddosData) {
                approveDdosServiceSwitch.checked = ddosData.isApprove;
                trafficScaleRangeInput.value = ddosData.trafficScale;
                showRangeValue(trafficScaleRangeInput.value);
            }
        } catch (error) {
            log.logError(`Get DDos settings from contract error, ${error.message}`);
        }

    }, 1000);

}

saveDdosButton.addEventListener('click', async() => {
    try {
        await saveDDos(approveDdosServiceSwitch.checked, trafficScaleRangeInput.value, (saveBtn, processingBtn) => {
            savedSuccessNotify();
            ipcRenderer.send("policy", parseInt(trafficScaleRangeInput.value));
            saveBtn.classList.remove("d-none");
            processingBtn.classList.add("d-none");
            log.logInfo(`ddos settings saved successfully. Approve: ${approveDdosServiceSwitch.checked}, TrafficScale: ${trafficScaleRangeInput.value}`);
        });
    } catch (error) {
        console.log(error);
        log.logError(`Save DDos settings to contract error. ${error.message}`);
    }
});

