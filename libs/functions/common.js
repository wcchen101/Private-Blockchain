let bitcoin = require('bitcoinjs-lib') // v3.x.x
let bitcoinMessage = require('bitcoinjs-message')
let fs = require('fs');

let getCurrentTime = function () {
  let date = new Date()
  let curTimestamp = date.getTime()
  return curTimestamp
};

let generateMessage = function (address, timestamp, message) {
  return address + ':' + timestamp + ':' + message
};

let setReqValResponse = function (address, requestTimeStamp, message, validationWindow) {
  let response = {
    "address": address,
    "requestTimeStamp": requestTimeStamp,
    "message": message,
    "validationWindow": validationWindow
  }
  return response
}

let setValidationResponse = function (address, requestTimeStamp, message, isValid) {
  let curTimestamp = getCurrentTime()
  let remainingTimeWindow = curTimestamp - requestTimeStamp
  let response = {
    "registerStar": isValid,
    "status": {
      "address": address,
      "requestTimeStamp": requestTimeStamp,
      "message": message
    },
    "validationWindow": remainingTimeWindow,
    "messageSignature": isValid
  }
  return response
}

let setStarDecodedResponse = function(block) {
  console.log('block', block)
  let decodedStory;
  if (block.body != undefined && block.body.star) {
    decodedStory = decdoedFromHex(block.body.star.story)
    block.body.star.storyDecoded = decodedStory
  }

  console.log('response block with decoded story', decodedStory)
  return block
}

let setResInRedis = function (client, key, res, validationWindow) {
  let resStr = JSON.stringify(res)
  client.set(key, resStr);

  // modify time to validationWindow for prod purpose
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
};

let checkIsSignatureValidate = function(message, address, signature) {
  return new Promise((resolve, reject) => {
    let isValid = bitcoinMessage.verify(message, address, signature)

    if (isValid) {
      return resolve(true)
    }

    return resolve(false)
  });
};

let setErrorMessage = function(status, error) {
  let response = {
    "statusCode": status,
    "error": error,
    "message": "Cannot find pages or internal server error. Please check the status code"
  }
  return response
};

let getRemainingTime = function(pastTimestamp, validationWindow) {
  let currentTimestap = getCurrentTime()
  let remainingTimeWindow = Number(pastTimestamp) + Number(validationWindow) * 1000 - Number(currentTimestap)
  return remainingTimeWindow
}

let encodedToHex = function(value) {
  const buf = Buffer.from(value, 'ascii');
  let encodedValue = buf.toString('hex')
  console.log(encodedValue)
  return encodedValue
}

let decdoedFromHex = function(value) {
  console.log('value', value)
  const buf = new Buffer(value, 'hex')
  let decodedValue = buf.toString()
  console.log('from hex to ascii', decodedValue)
  return decodedValue
}

exports.getCurrentTime = getCurrentTime;
exports.generateMessage = generateMessage;
exports.setReqValResponse = setReqValResponse;
exports.setResInRedis = setResInRedis;
exports.getResInRedis = getResInRedis;
exports.checkIsSignatureValidate = checkIsSignatureValidate;
exports.setValidationResponse = setValidationResponse;
exports.setErrorMessage = setErrorMessage;
exports.getRemainingTime = getRemainingTime;
exports.encodedToHex = encodedToHex;
exports.decdoedFromHex = decdoedFromHex;
exports.setStarDecodedResponse = setStarDecodedResponse;
