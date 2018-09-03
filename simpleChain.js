/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

const levelSandbox = require('./levelSandbox');

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
		// this.chain = [];
    this.chainLength = 0;
		levelSandbox.getAllLevelDBData().then((height) => {
			if (height == 0) {
				let genesisBlock = new Block("First block in the chain - Genesis block")
				this.addBlock(genesisBlock)
			} else {
        // TODO: it's better to reduce the memory use because the chain might be very long
				// levelSandbox.addDataToBlockchain().then((originalChain) => {
				// 	this.chain = this.chain.concat(originalChain)
				// }).then(console.log(this.chain))
        this.chainLength = height + 1;
			}
		});
  }

  // Add new block
  addBlock(newBlock){
    // Block height
    // newBlock.height = this.chain.length;
    this.getBlockHeight().then((height) => {
      newBlock.height = height + 1
    });
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(this.chainLength > 0){
      newBlock.previousBlockHash = this.chain[this.chainLength-1].hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    // this.chain.push(newBlock);
    levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock)).then((data) => console.log(data))
  }

  // Get block height
	getBlockHeight(){
    return new Promise((resolve) => {
			levelSandbox.getAllLevelDBData().then((height) => {
				console.log('height', height)
				resolve(height)
			});
		});
  }

  // get block
  async getBlock(blockHeight){
    return await new Promise((resolve, reject) => {
      levelSandbox.getLevelDBData(blockHeight).then((block) => {
        try {
          resolve(block)
        } catch (err) {
          reject(err)
        }
      });
    });
  }

  // validate block
  async validateBlock(blockHeight){
    // get block object
		return await new Promise((resolve, reject) => {
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
						resolve(false)
					}
				} catch (err) {
					reject(err)
				}
			});
		});
  }

 // Validate blockchain
  async validateChain(){
    let errorLog = [];
    let promiseBlock;
    let promisePreBlock;
    let promiseCurBlock;
    let promiseValidation = await new Promise((resolve, reject) => {
      for (let i = 0; i < this.chainLength; i++) {
          if (i == 0) {
            continue;
          }

          let preBlock;
          let curBlock;
          promisePreBlock = this.getBlock(i - 1).then((block) => {
            preBlock = block

          });
          promiseCurBlock = this.getBlock(i).then((block) => {
            curBlock = block
          });

          promiseBlock = this.validateBlock(i).then((isBlockValidation) => {
            // validate block
    				console.log(isBlockValidation)
            if (!isBlockValidation)errorLog.push(i);

            // compare blocks hash link
    				console.log('hash', preBlock.hash)
    				console.log('previous hash', curBlock.previousBlockHash)
            let blockHash = preBlock.hash;
            let previousHash = curBlock.previousBlockHash;
            if (blockHash!==previousHash) {
              //mark problematic block as error block
              curBlock.body = 'block error'
              errorLog.push(i);
              reject(false);
            }
          });
        resolve(true);
      }
    });

    let res = await Promise.all([
      promiseValidation,
      promiseBlock,
      promisePreBlock,
      promiseCurBlock
    ]);

    console.log('-----***** The validation result is below *****-----');
    if (errorLog.length>0) {
      console.log('***** The validation result is not passed! *****');
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: '+ errorLog);
    } else {
      console.log('***** The validation result is passed! *****');
      console.log('No errors detected');
    }
  }
}
