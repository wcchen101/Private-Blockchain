'use strict';

const Hapi = require('hapi');

const Blockchain = require('./simpleChain');

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
      return blockchain.getBlock(request.params.id)
           .then((res) => res)
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
