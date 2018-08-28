/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

const levelSandbox = require('./levelSandbox');
// const level = require('level');
// const chainDB = './chaindata';
// const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block          |
|  ===============================================*/

class Block{
  constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain    |
|  ================================================*/

class Blockchain{
  constructor(){
		this.chain = [];
		levelSandbox.getAllLevelDBData().then((height) => {
			if (height == 0) {
				let genesisBlock = new Block("First block in the chain - Genesis block")
				// this.chain.push(genesisBlock)
				this.addBlock(genesisBlock)
			} else {
				levelSandbox.addDataToBlockchain().then((originalChain) => {
					console.log('debug ',originalChain)
					this.chain = this.chain.concat(originalChain)
				}).then(console.log(this.chain))
			}
		});

		// let genesisBlock = new Block("First block in the chain - Genesis block")
		// // this.chain.push(genesisBlock)
		// this.addBlock(genesisBlock)
		// levelSandbox.addLevelDBData(0, JSON.stringify(genesisBlock)).then((data) => console.log(data))

  }

  // Add new block
  addBlock(newBlock){
    // Block height
    newBlock.height = this.chain.length;

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(this.chain.length>0){
      newBlock.previousBlockHash = this.chain[this.chain.length-1].hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    this.chain.push(newBlock);
    // this.getBlockHeight(function(height) {
    //   levelSandbox.addLevelDBData(height, JSON.stringify(newBlock))
    // });
		// newBlock.height = getBlockHeight()

    levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock)).then((data) => console.log(data))
  }

  // Get block height
	getBlockHeight(){

    // levelSandbox.getAllLevelDBData(function(i) {
    //   chainHeights = i
    //   if (callback != undefined) {
    //     callback(chainHeights)
    //   } else {
    //     return chainHeights
    //   }
    // })
    return new Promise((resolve) => {
			levelSandbox.getAllLevelDBData().then((height) => {
				console.log('height', height)
				resolve(height)
			});
		});
    // return this.chain.length-1;
		// return chainHeights
  }

  // get block
  getBlock(blockHeight){
    // return object as a single string
    // let chain = this.chain[blockHeight]
		let chain;
    // if (callback != undefined) {
    //     levelSandbox.getLevelDBData(blockHeight, function(data) {
    //       callback(JSON.parse(JSON.stringify(data)))
    //   })
    // }
    levelSandbox.getLevelDBData(blockHeight).then((block) => (
      chain = block
  	)).then(chain => chain)
    // return JSON.parse(JSON.stringify(chain))
  }

  // validate block
  validateBlock(blockHeight){
    // get block object
		let res;
		return new Promise((resolve, reject) => {
			levelSandbox.getLevelDBData(blockHeight).then((block) => {
				try {
					// get block hash
					let blockHash = block.hash;
					// remove block hash to test block integrity
					block.hash = '';
					// generate block hash
					let validBlockHash = SHA256(JSON.stringify(block)).toString();
					// Compare
					if (blockHash===validBlockHash) {
						console.log('passed validation! ')
						resolve(true)
					} else {
						console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
						resoleve(false)
					}
				} catch (err) {
					reject(err)
				}

			});
		});

    // this.getBlock(blockHeight, function(block) {
    //   // get block hash
    //   let blockHash = block.hash;
    //   // remove block hash to test block integrity
    //   block.hash = '';
    //   // generate block hash
    //   let validBlockHash = SHA256(JSON.stringify(block)).toString();
    //   // Compare
    //   if (callback != undefined && blockHash===validBlockHash) {
    //     callback(true);
    //   } else if (callback != undefined && blockHash !== validBlockHash) {
    //     console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
    //     callback(false);
    //   }
    //   return (blockHash===validBlockHash) ? true : false
    // });

  }

 // Validate blockchain
  validateChain(){
    let errorLog = [];
    for (var i = 0; i < this.chain.length-1; i++) {
        this.validateBlock(i).then((isBlockValidation) => {
        // validate block
				console.log(isBlockValidation)
        if (!isBlockValidation)errorLog.push(i);
        // compare blocks hash link
        let blockHash = this.chain[i].hash;
        let previousHash = this.chain[i+1].previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      })
    }
    if (errorLog.length>0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: '+errorLog);
    } else {
      console.log('No errors detected');
    }
  }
}
