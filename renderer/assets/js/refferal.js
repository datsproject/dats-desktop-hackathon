const createRefferealCodeBTN = document.querySelector('#createRefferalCode');
const saveRefferalCodeBTN = document.querySelector('#saveRefferalCode');
const refferalCodeINPUT = document.querySelector('#refferalCode')

createRefferealCodeBTN.addEventListener('click', async() => {
    ipcRenderer.send("refferal", window.account);
    const refferalInfo = await ipcRenderer.invoke("refferalCode");
    refferalCodeINPUT.value = refferalInfo.encryptedRefferalCode;
    console.log(refferalInfo.macAddress);
    console.log(refferalInfo.externalIpAddress)
});

saveRefferalCodeBTN.addEventListener('click', () => {
    // Save to db refferalCode
});

const getRefferalCode = () => {

    const refferalCode = undefined;
    if (refferalCode) {
        refferalCodeINPUT.value = refferalCode;
        createRefferealCodeBTN.classList.add('d-none');
        saveRefferalCodeBTN.classList.add('d-none');
    }

}