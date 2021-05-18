var CryptoJS = require("crypto-js");
const iv = 0;

export function encryptString(message, key) {
  let encJson = CryptoJS.AES.encrypt(JSON.stringify(message), key).toString();
  let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
  return encData;
}

export function decryptString(message, key) {
  let decData = CryptoJS.enc.Base64.parse(message).toString(CryptoJS.enc.Utf8);
  try {
    let bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(bytes);
  } catch (error) {
    return "🔒";
  }
}
