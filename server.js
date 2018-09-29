'use strict';

const Hapi = require('hapi');

const Blockchain = require('./libs/classes/simpleChain');
const Block = require('./libs/classes/simpleBlock');
const common = require('./libs/functions/common');

// Create a server with a host and port
const server = Hapi.server({
    host: 'localhost',
    port: 8000
});

const validationWindow = 300;

let redis = require('redis');
let client = redis.createClient(); // default: 127.0.0.1 and port 6379

client.on('connect', function() {
    console.log('Redis client successfully connected! ');
});

client.on('error', function (err) {
    console.log('Some error happened in redis: ' + err);
});

const blockchain = new Blockchain();

// Add the route
server.route({
    method: 'GET',
    path: '/hello',
    handler: function(request,h) {
        return'hello world';
    }
});

// api for getting certain block
server.route({
    method: 'GET',
    path: '/block/{id}',
    handler: (request, h) => {
      return new Promise((resolve, reject) => {
        let targetBlockId = request.params.id
        let blockHeight = blockchain.blockHeight

        //ok to get block
        try {

          // check if id greater than block height
          if (targetBlockId > blockHeight) {
            let response = common.setErrorMessage('404', 'cannot find the block using this id')
            console.log('error: ', response)
            return resolve(response)
          }

          blockchain.getBlock(targetBlockId).then((res) => {
            console.log('res', res)
            let blockWithStoryDecoded = common.setStarDecodedResponse(res)
            console.log('blockWithStoryDecoded', blockWithStoryDecoded)
            resolve(blockWithStoryDecoded)
          });

        } catch(err) {
          console.log('catch error', err)
          return reject(err);
        }

      });
    }
});

// api for getting certain stars using addrss
server.route({
    method: 'GET',
    path: '/stars/address:{address}',
    handler: (request, h) => {
      return new Promise(async (resolve, reject) => {
        let targetAddress = request.params.address
        let blockHeight = blockchain.blockHeight
        let foundBlock = []

        try {
          for (let i = 0; i < blockHeight + 1; i++) {
            let block = await blockchain.getBlock(i)
            if (block != undefined && block.body != undefined && block.body.address != undefined && block.body.address === targetAddress) {
              let blockWithStoryDecoded = common.setStarDecodedResponse(block)
              foundBlock.push(blockWithStoryDecoded)
            }
          }

          if (foundBlock == undefined || foundBlock.length == 0) {
            let response = common.setErrorMessage('404', 'cannot find the block using this address')
            console.log('error: ', response)
            return resolve(response)
          }

          return resolve(foundBlock)

        } catch(err) {
          console.log(err)
          return reject(err)
        }
      });
    }
});

// api for getting certain stars using blockHashs
server.route({
    method: 'GET',
    path: '/stars/hash:{hash}',
    handler: (request, h) => {
      return new Promise(async (resolve, reject) => {
        let targetBlockHash = request.params.hash
        let blockHeight = blockchain.blockHeight
        let foundBlock;

        try {
          for (let i = 0; i < blockHeight + 1; i++) {
            let block = await blockchain.getBlock(i)
            if (block != undefined && block.hash != undefined && block.hash === targetBlockHash) {
              let blockWithStoryDecoded = common.setStarDecodedResponse(block)
              foundBlock = blockWithStoryDecoded
              break
            }
          }

          if (foundBlock == undefined) {
            let response = common.setErrorMessage('404', 'cannot find the block using this hash')
            console.log('error: ', response)
            return resolve(response)
          }

          return resolve(foundBlock)

        } catch(err) {
          console.log(err)
          return reject(err)
        }
      });
    }
});

// api for post new block
server.route({
    method: 'POST',
    path: '/block',
    handler: (request, h) => {
      return new Promise(async (resolve, reject) => {
        try {
          let requestPayload = request.payload;
          if (requestPayload != undefined && requestPayload !== '') {
            let res = {}
            let body = {}

            //set block body
            body.address = requestPayload.address
            body.star = requestPayload.star

            // encoded star story with hex
            if (body.star != undefined && requestPayload.star != undefined) {
              // check story not more than 250 words or 500 bytes
              let encodingStory = requestPayload.star.story
              if (encodingStory.length > 250) {
                encodingStory = encodingStory.substring(0, 250)
                console.log(encodingStory)
              }
              body.star.story = common.encodedToHex(encodingStory)
            }

            // check cache, to get the record which containing validation result: isValid
            let cachedRes;
            await common.getResInRedis(client, requestPayload.address).then((res) => {
              cachedRes = JSON.parse(res)
            });
            console.log('before cachedRes', cachedRes)
            // if there is no cached about this block or address, it must be an error!
            if (cachedRes == undefined || cachedRes.isPassedValidation === undefined || cachedRes.isBlockAdded === undefined) {
              let response = common.setErrorMessage('500', 'internal server error!')
              console.log('error: ', response)
              return resolve(response)
            }
            // check if passed the signature validation, if isPassedValidation == false
            // then it is not allowed to add and return
            if (cachedRes && !cachedRes.isPassedValidation) {
              let response = common.setErrorMessage('500', 'do not pass the validation!')
              console.log('error: ', response)
              return resolve(response)
            }

            // check if the block has been added before
            if (cachedRes && cachedRes.isBlockAdded) {
              let response = common.setErrorMessage('500', 'the block has been already added!')
              console.log('error: ', response)
              return resolve(response)
            }

            // because it knows the validation is passed, then it can start to add block
            let newBlock = new Block(body);
            let blockHeight;
            await blockchain.addBlock(newBlock).then((height) => {
              blockHeight = height;

              // block added is set to true
              let requestTimeStamp = cachedRes.requestTimeStamp
              let remainingTimeWindow = common.getRemainingTime(requestTimeStamp, validationWindow)
              let address = requestPayload.address
              cachedRes.isBlockAdded = true;

              common.updateResInRedis(client, address, cachedRes, remainingTimeWindow)
            });
            console.log('blockHeight',blockHeight)
            console.log('after', cachedRes)
            let addedBlock;
            await blockchain.getBlock(blockHeight).then((block) => {
              addedBlock = block
            });
            console.log('addedBlock', addedBlock)

            res = addedBlock

            return resolve(res)

          } else {
            let response = common.setErrorMessage('500', 'internal server error, post body might have error')
            console.log('error: ', response)
            return resolve(response)
          }
        } catch(err) {
          console.log('error', err);
          return reject(err);
        }
      });
    }
});


// api for requesting validation
server.route({
    method: 'POST',
    path: '/requestValidation',
    handler: (request, h) => {
      return new Promise(async (resolve, reject) => {
        try {
          let requestPayload = request.payload;
          if (requestPayload.address != undefined && requestPayload.address !== '') {

            // check cache, because it can get the record if it send the requestvalidation before
            // and it can get it and reduce the validation window
            let cachedRes;
            await common.getResInRedis(client, requestPayload.address).then((res) => {
              cachedRes = JSON.parse(res)
            });
            if (cachedRes != undefined || cachedRes) {
              // if there is a cache result, modify remaining time window
              let pastTimestamp = cachedRes.requestTimeStamp
              let remainingTimeWindow = common.getRemainingTime(pastTimestamp, validationWindow)
              cachedRes.validationWindow = remainingTimeWindow
              console.log('use cache', cachedRes)
              return resolve(cachedRes)
            }
            console.log('no cache')

            let address = requestPayload.address
            let currentTimestamp = common.getCurrentTime()
            let message = common.generateMessage(address, currentTimestamp, 'startRegistry')

            let res = common.setReqValResponse(address, currentTimestamp, message, validationWindow)

            //set req info into redis
            common.setResInRedis(client, address, res, validationWindow)

            return resolve(res)

          } else {
            let response = common.setErrorMessage('500', 'internal server error, post body might have error')
            console.log('error: ', response)
            return resolve(response)
          }
        } catch(err) {
          console.log(err);
          return reject('error');
        }
      });
    }
});

// api for requesting validation
server.route({
    method: 'POST',
    path: '/message-signature/validate',
    handler: (request, h) => {
      return new Promise(async (resolve, reject) => {
        try {
          let requestPayload = request.payload;

          if (requestPayload.address != undefined && requestPayload.address !== '') {

            let cachedRes;
            await common.getResInRedis(client, requestPayload.address).then((res) => {
              cachedRes = JSON.parse(res)
            });

            if (cachedRes == undefined || !cachedRes) {
              let response = common.setErrorMessage('500', 'validation error')
              console.log('error: ', response)
              return resolve(response)
            };

            let address = requestPayload.address
            let signature = requestPayload.signature
            let message = cachedRes.message
            let requestTimeStamp = cachedRes.requestTimeStamp
            let isValid = false;
            let remainingTimeWindow = common.getRemainingTime(requestTimeStamp, validationWindow)

            await common.checkIsSignatureValidate(message, address, signature).then((validRes) => {
              // check if valid then add record into redis. doing it is because
              // when there is a post new block request, it can check if the validation
              // isValid == true or false. ture then allow to add, otherwise deny
              // isBlockAdded to record if the address add the block or not
              isValid = validRes;
              if (isValid && isValid == true) {
                cachedRes.isPassedValidation = true;
              } else {
                cachedRes.isPassedValidation = false;
              }
              cachedRes.isBlockAdded = false;
              common.updateResInRedis(client, address, cachedRes, remainingTimeWindow)
            });

            let response = await common.setValidationResponse(address, requestTimeStamp, message, isValid)
            return resolve(response)

          } else {
            let response = common.setErrorMessage('500', 'internal server error, post body might have error')
            console.log('error: ', response)
            return resolve(response)
          }
        } catch(err) {
          console.log(err);
          return reject(err);
        }
      });
    }
});

// Start the server
async function start() {
    try {
        await server.start();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
    console.log('Server running at:', server.info.uri);
};

start();
