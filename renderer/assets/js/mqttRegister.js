const mqtt = remote.require('./services/MQTT.js');
const restService = remote.require('./services/restService.js');
const store = remote.require('./services/store.js');

async function mqttRegister(){
    if (store.get("connectedAccount") == undefined) store.set("connectedAccount", window.account);

    if (store.get("connectedAccount") != window.account) {
        Lobibox.notify('warning', {
            icon: 'bx bx-error-circle',
            delay: false,
            delayIndicator: false,
            position: 'center top',
            size: 'mini',
            msg: 'You have logged in with an account that is not registered in the contract.'
        });
    }

    // selectedAccount = store.get("connectedAccount");
    // window.account = selectedAccount;

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