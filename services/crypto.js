const { safeStorage } = require('electron');
const crypto = require('crypto');

function encryptMsg(plainString, AesKey, AesIV) {
    const cipher = crypto.createCipheriv("aes-256-cbc", AesKey, AesIV);
    let encrypted = Buffer.concat([cipher.update(Buffer.from(plainString, "utf8")), cipher.final()]);
    return encrypted.toString("base64");
}

const decryptMsg = (base64String, AesKey, AesIV) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", AesKey, AesIV);
    const deciphered = Buffer.concat([decipher.update(Buffer.from(base64String, "base64")), decipher.final()]);
    return deciphered.toString("utf8");
}

module.exports = {
    encryptMsg,
    decryptMsg
}