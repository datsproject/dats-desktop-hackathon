const find = require('find-process');
const store = require('./store.js');

const findProcesses = (attackId) => {
    find('name', 'start', true)
        .then(function(list) {
            store.remove(attackId);
            store.set(attackId, list[0].pid);
        }, function(err) {
            console.log(err.stack || err);
        });
}

module.exports = {
    findProcesses
}