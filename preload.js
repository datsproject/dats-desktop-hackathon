const { ipcRenderer } = require('electron');

async function getGeolocation() {
    const result = await ipcRenderer.invoke("getGeolocation");
    return result;
}

window.addEventListener('DOMContentLoaded', async() => {

    const result = await getGeolocation();

    localStorage.setItem("externalIpAddress", result.externalIpAddress);
    localStorage.setItem("geolocation", JSON.stringify(result.geolocation));

    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (dependency of['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
});