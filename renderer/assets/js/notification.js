function savedSuccessNotify() {
    Lobibox.notify('success', {
        pauseDelayOnHover: true,
        size: 'mini',
        rounded: true,
        icon: 'bx bx-check-circle',
        delayIndicator: false,
        continueDelayOnInactiveTab: false,
        position: 'top right',
        msg: 'Saved successfully.'
    });
}

function savedErrorNotify(message) {
    Lobibox.notify('error', {
        pauseDelayOnHover: true,
        size: 'mini',
        rounded: true,
        icon: 'bx bx-no-entry',
        delayIndicator: false,
        continueDelayOnInactiveTab: false,
        position: 'top right',
        msg: message
    });
}


const startAttackNotify = (attackStartTime, attackType, attackTarget, attackPower, attackDuration) => {
    Lobibox.notify('success', {
        title: 'Attack Started',
        delay: false,
        sound: false,
        size: 'mini',
        width: 400,
        height: 'auto',
        rounded: true,
        icon: 'bx bxs-bell-ring',
        position: 'top right',
        msg: `<hr>
                <ul> 
                    <li>AttackStartTime: ${attackStartTime}</li> 
                    <li>AttackType: ${attackType}</li> 
                    <li>AttackTarget: ${attackTarget}</li> 
                    <li>AttackPower: ${attackPower} mbit</li> 
                    <li>AttackDuration: ${attackDuration} seconds</li>
                </ul>`
    });
}

let data;

const finishAttackNotify = (logs) => {
    data = logs['logs'];
    Lobibox.notify('error', {
        title: 'Attack Finished',
        delay: false,
        sound: false,
        size: 'mini',
        width: 400,
        height: 'auto',
        rounded: true,
        icon: 'bx bxs-bell-ring',
        position: 'top right',
        closeOnClick: false,
        msg: `<hr> DDos attack has been finished. <br> <a id="showLogs" type="button" class="btn btn-sm btn-link" data-bs-toggle="modal" data-bs-target="#exampleDarkModal">Please click to see stats.</a>`
    });

    document.querySelector('#showLogs').addEventListener('click', () => {
        const statsTable = document.querySelector('#stats');
        const statsBody = document.querySelector('#statsRows');
        statsBody.innerHTML = '';
        let row;
        for (let i = 0; i < data.length; i++) {
            row = JSON.parse(data[i].replace('\r', ''));
            statsBody.innerHTML +=
                `
                <tr>
                    <td> ${row["Target"]} </td>
                    <td> ${row["Port"]} </td>
                    <td> ${row["Method"]} </td>
                    <td> ${row["PPS"]} </td>
                    <td> ${row["BPS"]} </td>
                </tr>
            `;

        }
    });
}


ipcRenderer.on('startAttackNotify', (event, obj) => {
    startAttackNotify(obj.attackStartTime, obj.attackType, obj.attackTarget, obj.attackPower, obj.attackDuration);
});

ipcRenderer.on('finishAttackNotify', (event, obj) => {
    finishAttackNotify(obj);
})