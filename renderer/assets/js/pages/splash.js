const { ipcRenderer } = require('electron');
const remote = require("@electron/remote");


const webContents = remote.getCurrentWebContents();


ipcRenderer.on('wsl-message', (event, text) => {
    console.log(text);
    const checkListUL = document.querySelector('#checkList')
    let listItem = `
    <li class="list-group-item d-flex align-items-center radius-10 mb-2 shadow-sm">
        <div class="d-flex align-items-center">
            <div class="font-20"><i class="flag-icon flag-icon-in"></i>
            </div>
            <div class="flex-grow-1 ms-2">
                <h6 id="test" class="mb-0">${text}</h6>
            </div>
        </div>
    </li>
    `

    checkListUL.innerHTML += listItem;
});

ipcRenderer.on('message', function(event, text) {
    console.log("Auto Updater Message:", text);
});