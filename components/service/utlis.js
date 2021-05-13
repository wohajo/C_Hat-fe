var CryptoJS = require("crypto-js");
const iv = 0;

export function encryptString(message, key) {
  return CryptoJS.AES.encrypt(JSON.parse(JSON.stringify(message)), key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  }).toString();
}

export function decryptString(message, key) {
  const decrypted = CryptoJS.AES.decrypt(message, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  }).toString(CryptoJS.enc.Utf8);
  if (decrypted === "") return "🔒";
  return decrypted;
}
