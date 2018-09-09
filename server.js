'use strict';

const Hapi = require('hapi');

const Blockchain = require('./simpleChain');
const Block = require('./simpleBlock');

// Create a server with a host and port
const server = Hapi.server({
    host: 'localhost',
    port: 8000
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
          let newBlock = new Block(payloadParsed.body);
          console.log('new block', newBlock)
          console.log('success')
          return new Promise((resolve, reject) => {
            blockchain.addBlock(newBlock)
                      .then(resolve('success'))
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
