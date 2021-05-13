var CryptoJS = require("crypto-js");
const iv = 0;

export function encryptString(message, key) {
  console.log(`ecrypting ${message}`);
  console.log(`with ${key}`);
  return CryptoJS.AES.encrypt(JSON.parse(JSON.stringify(message)), key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  }).toString();
}

export function decryptString(message, key) {
  console.log(`decrypting ${message}`);
  console.log(`with ${key}`);
  const decrypted = CryptoJS.AES.decrypt(message, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  }).toString(CryptoJS.enc.Utf8);
  console.log(decrypted);
  if (decrypted === "") return "🔒";
  return decrypted;
}
