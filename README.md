# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Technology stack
- Node.js
- Hapi (Node server framework)
- crypto-js
- level

## API design
- Get certain block data
```
/block/:id   [GET]
```

- Add new block data
```
/block       [POST]
```

### Try this project

- Install the node modules dependencies
```
npm install
```
- Start app server
```
node server.js
```

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
