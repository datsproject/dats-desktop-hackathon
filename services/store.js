const Store = require('electron-store');

const store = new Store({ encryptionKey: 'J/PYjc1ftDFK5+77U1PB80v2TamokGap5yCIP2YI6tQ=' });

// store.openInEditor();

const set = (key, value) => {
    store.set(key, value);
}

const get = (key) => {
    return store.get(key);
}

const remove = (key) => {
    store.delete(key);
}

const clear = () => {
    store.clear();
}

const openInEditor = () => {
    store.openInEditor();
}

module.exports = {
    set,
    get,
    remove,
    clear,
    openInEditor
}