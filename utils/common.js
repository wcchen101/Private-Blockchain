var bitcoin = require('bitcoinjs-lib') // v3.x.x
var bitcoinMessage = require('bitcoinjs-message')

let config = require('./config')

let getCurrentTime = function () {
  let date = new Date()
  let curTimestamp = date.getTime()
  return curTimestamp
};

let generateMessage = function (address, timestamp, message) {
  return address + ':' + timestamp + ':' + message
};

let setResponse = function (address, requestTimeStamp, message, validationWindow) {
  let response = {
    "address": address,
    "requestTimeStamp": requestTimeStamp,
    "message": message,
    "validationWindow": validationWindow
  }
  return response
}

let setResInRedis = function (client, key, res, validationWindow) {
  let resStr = JSON.stringify(res)
  client.set(key, resStr);
  //TODO: modify time to validationWindow for prod purpose
  client.expire(key, validationWindow);
  console.log('set into redis successfully for ' + validationWindow + ' seconds')
  return 'success'
}

let getResInRedis = function (client, key) {
  return new Promise((resolve, reject) => {
    client.get(key, function(err, res) {
      if (err) {
        console.log(err)
        reject(err)
      }
      console.log('get successfully', res)
      resolve(res)
    });
  })
}

let checkIsSignatureValidate = function(message, address, signature) {
  return new Promise((resolve, reject) => {
    console.log(message, privateKey, keyPair)
    let isValid = bitcoinMessage.verify(message, address, signature)
    if (isValid) {
      return resolve(true)
    }
    return resolve(false)
  });
}

exports.getCurrentTime = getCurrentTime;
exports.generateMessage = generateMessage;
exports.setResponse = setResponse;
exports.setResInRedis = setResInRedis;
exports.getResInRedis = getResInRedis;
exports.checkIsSignatureValidate = checkIsSignatureValidate;
