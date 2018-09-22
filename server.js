'use strict';

const Hapi = require('hapi');

const Blockchain = require('./simpleChain');
const Block = require('./simpleBlock');
const common = require('./utils/common');
const config = require('./utils/config');

// Create a server with a host and port
const server = Hapi.server({
    host: 'localhost',
    port: 8000
});

const validationWindow = 300;
const privateKey = config.privateKey

let redis = require('redis');
let client = redis.createClient(); // default: 127.0.0.1 and port 6379

client.on('connect', function() {
    console.log('Redis client successfully connected! ');
});

client.on('error', function (err) {
    console.log('Some error happened in redis: ' + err);
});

let blockchain = new Blockchain();

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
        let blockHeight = blockchain.blockHeight

        // check if id greater than block height
        if (request.params.id > blockHeight) {
          console.log('error')
          resolve('error')
        } else {
          //ok to get block
          try {
            blockchain.getBlock(request.params.id).then((res) => resolve(res));
          } catch(err) {
            reject('error');
          }
        }
      });
    }
});

// api for post new block
server.route({
    method: 'POST',
    path: '/block',
    handler: (request, h) => {
      try {
        let payloadParsed = JSON.parse(request.payload);
        console.log(payloadParsed, typeof payloadParsed);
        if (payloadParsed.body != undefined && payloadParsed.body !== '') {
          let res = {'body': payloadParsed.body}
          let newBlock = new Block(payloadParsed.body);
          console.log('new block', newBlock)
          console.log('success')
          return new Promise((resolve, reject) => {
            blockchain.addBlock(newBlock)
                      .then(resolve(JSON.stringify(res)))
                      .catch(reject('error'))
          });
        } else {
          console.log('error here');
          return 'error';
        }
      } catch(err) {
        console.log(err);
        return 'error';
      }
    }
});


// api for requesting validation
server.route({
    method: 'POST',
    path: '/requestValidation',
    handler: (request, h) => {
      return new Promise(async (resolve, reject) => {
        try {
          let payloadParsed = JSON.parse(request.payload);
          console.log(payloadParsed, typeof payloadParsed, payloadParsed.address);
          if (payloadParsed.address != undefined && payloadParsed.address !== '') {

            // TODO: check cache
            let cachedRes;
            await common.getResInRedis(client, payloadParsed.address).then((res) => {
              cachedRes = res
            });
            console.log('server cache result',cachedRes)
            if (cachedRes != undefined || cachedRes) {
              console.log('use cache')
              return resolve(cachedRes)
            }
            console.log('no cache')

            let address = payloadParsed.address
            let currentTimestamp = common.getCurrentTime()
            let message = common.generateMessage(address, currentTimestamp, 'startRegistry')

            let res = common.setResponse(address, currentTimestamp, message, validationWindow)

            //set req info into redis
            common.setResInRedis(client, address, res, validationWindow)

            console.log('there', res)
            return resolve(JSON.stringify(res))

          } else {
            console.log('error here');
            return reject('error');
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
          let payloadParsed = JSON.parse(request.payload);

          console.log(payloadParsed, typeof payloadParsed, payloadParsed.address);
          if (payloadParsed.address != undefined && payloadParsed.address !== '') {

            let cachedRes;
            await common.getResInRedis(client, payloadParsed.address).then((res) => {
              cachedRes = JSON.parse(res)
            });

            if (cachedRes == undefined || !cachedRes) {
              return resolve('error')
            };

            let address = payloadParsed.address
            let signature = payloadParsed.signature
            let message = cachedRes.message
            console.log('message', cachedRes.message)
            console.log('private key', privateKey)
            let isValid = await common.checkIsSignatureValidate(message, privateKey, signature)
            return resolve(isValid)
          } else {
            console.log('error here');
            return resolve('error');
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
