# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Technology stack
- Node.js
- Hapi (Node server framework)
- crypto-js
- level
- bitcoinjs-lib
- bitcoinjs-message
- redis (need to install and run the redis server before starting app)

## API design
- Get certain block data using blockHeight
```
/block/:id   [GET]
```
URL Params:
- required: id = [integer], ex. id = 1, 2, ....

Success Response:
ex.
```
{
    "hash": "17ed729b608b0159ef7e67531bbe4d0cd559d8df9dc65d275a0f2e3e542bfcd1",
    "height": 7,
    "body": {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
            "dec": "-26° 29 24.9",
            "ra": "16h 29m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1537627775",
    "previousBlockHash": "db968bbd305fcee831a6fbc613900a90ecf59a558c54880d0411cd101c020c92"
}
```
Error Response:
ex.
```
{
    "statusCode": "404",
    "error": "cannot find the block using this id",
    "message": "Cannot find pages or internal server error. Please check the status code"
}
```

- Get certain stars data using address
```
/stars/address:{address}  [GET]
```

URL params:
required: address = [string], ex. address = "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"

Success response:
ex.
```
[
    {
        "hash": "db968bbd305fcee831a6fbc613900a90ecf59a558c54880d0411cd101c020c92",
        "height": 6,
        "body": {
            "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
            "star": {
                "dec": "-26° 29 24.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1537627619",
        "previousBlockHash": "31d8e3b6960904f1dbceef0ee5080babb5a8e13bf500799aae50179c83fd8ec9"
    },
    {
        "hash": "17ed729b608b0159ef7e67531bbe4d0cd559d8df9dc65d275a0f2e3e542bfcd1",
        "height": 7,
        "body": {
            "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
            "star": {
                "dec": "-26° 29 24.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1537627775",
        "previousBlockHash": "db968bbd305fcee831a6fbc613900a90ecf59a558c54880d0411cd101c020c92"
    },
    ...
]
```

Error Response:
ex.
```
{
    "statusCode": "404",
    "error": "cannot find the block using this address",
    "message": "Cannot find pages or internal server error. Please check the status code"
}
```

- Get certain stars data using block hash
```
/stars/hash:{hash}  [GET]
```
URL params:
- require: hash = [string], ex. hash = "17ed729b608b0159ef7e67531bbe4d0cd559d8df9dc65d275a0f2e3e542bfcd1"

Success Response:
ex.
```
{
    "hash": "17ed729b608b0159ef7e67531bbe4d0cd559d8df9dc65d275a0f2e3e542bfcd1",
    "height": 7,
    "body": {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
            "dec": "-26° 29 24.9",
            "ra": "16h 29m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1537627775",
    "previousBlockHash": "db968bbd305fcee831a6fbc613900a90ecf59a558c54880d0411cd101c020c92"
}
```

Error Response:
ex.
```
{
    "statusCode": "404",
    "error": "cannot find the block using this hash",
    "message": "Cannot find pages or internal server error. Please check the status code"
}
```


- Add new block data
```
/block       [POST]
```
Data params:
ex.
```
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29uuuuuu 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}
```

Success response:
ex.
```
{
    "registerStar": true,
    "status": {
        "address": "1DqL9rou1s3mkBezMUd74zdVyAivzaeVTs",
        "requestTimeStamp": 1537675062846,
        "message": "1DqL9rou1s3mkBezMUd74zdVyAivzaeVTs:1537675062846:startRegistry"
    },
    "validationWindow": 180918,
    "messageSignature": false
}
```
Error response:
ex.
```
{
  "statusCode": '500',
  "error": 'internal server error, post body might have error',
  "message": "Cannot find pages or internal server error. Please check the status code"
}
```

- Request validation
```
/requestValidation  [POST]
```
Data params:
ex.
```
{
  "address":"1DqL9rou1s3mkBezMUd74zdVyAivzaeVTs"
}
```
Success response:
ex.
```
{
  "address":"1DqL9rou1s3mkBezMUd74zdVyAivzaeVTs",
  "requestTimeStamp":1537675062846,
  "message":"1DqL9rou1s3mkBezMUd74zdVyAivzaeVTs:1537675062846:startRegistry",
  "validationWindow":300
}
```
Error response:
ex.
```
{
  "statusCode": '500',
  "error": 'internal server error, post body might have error',
  "message": "Cannot find pages or internal server error. Please check the status code"
}
```

- Message signature validation
```
/message-signature/validate [POST]
```

Data Params:
ex.
```
{  "address": "1DqL9rou1s3mkBezMUd74zdVyAivzaeVTs",
	 "signature": "IC3OXpFwEoTC5pvj44py8kFWgCKsCNJG0y651Qliil42GKJM8aOQZ2q1+DVg0NxNNO831ZhjPFGoBOYnDGujBq0="
}
```

Success response:
ex.
```
{
    "registerStar": true,
    "status": {
        "address": "1DqL9rou1s3mkBezMUd74zdVyAivzaeVTs",
        "requestTimeStamp": 1537675062846,
        "message": "1DqL9rou1s3mkBezMUd74zdVyAivzaeVTs:1537675062846:startRegistry"
    },
    "validationWindow": 180918,
    "messageSignature": false
}
```

Error response:
ex.
```
{
  "statusCode": '500',
  "error": 'internal server error, post body might have error',
  "message": "Cannot find pages or internal server error. Please check the status code"
}
```

### Try this project

Run the project using shell script(include installing node modules, redis, and run redis and app server)
```
sh run.sh
```
<!-- - Install the node modules dependencies
```
npm install
```
- Run the redis server before starting app server
```
  src/redis-server
```
- Start app server
```
node server.js
``` -->

## Testing for private blockchain

To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Copy and paste your code into your node session
4: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop
```
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```
6: Validate blockchain
```
blockchain.validateChain();
```
7: Induce errors by changing block data
```
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain[inducedErrorBlocks[i]].data='induced chain error';
}
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```

### Reference
- Udacity coursework
- Udacity exclusive Knowledge forum
- Redis usage: https://hackernoon.com/using-redis-with-node-js-8d87a48c5dd7
- bitcoinjs-message: https://github.com/bitcoinjs/bitcoinjs-message
- REST API Documentation Best Practice: https://bocoup.com/blog/documenting-your-api
- Encoded and decoded in Node.js: https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings
- Redis installation guide: https://redis.io/download
