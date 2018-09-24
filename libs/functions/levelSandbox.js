/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
let addLevelDBData = function(key, value) {
  return new Promise(function(resolve, reject) {
    db.put(key, value, function(err) {
      if (err) {
        console.log('Block ' + key + ' submission failed', err);
        reject(err)
      }
      resolve('Block inserted into db')
    })
  })
};

// Get data from levelDB with key
let getLevelDBData = function(key) {
  return new Promise(function(resolve, reject) {
    db.get(key, function(err, value) {
    if (err) {
      reject(err)
      console.log('Not found!', err);
    }
    resolve(JSON.parse(value))
    console.log('Value = ' + value);
    })
  })
}

// Add data to levelDB with value
function addDataToLevelDB (value) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
          i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function() {
          console.log('Block #' + i);
          addLevelDBData(i, value);
        });
}

// Add data to levelDB with value
let getAllLevelDBData = function() {
  return new Promise(function(resolve, reject) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
        i++;
        }).on('error', function(err) {
            console.log('Unable to read data stream!', err)
            reject(err)
        }).on('close', function() {
          console.log('Block #' + i);
          i -= 1
          if (i == -1) {
            i = 0
          }
          console.log('db height', i)
          resolve(i)
        }).on('end', function() {

    });
  });
}

// Add data to levelDB with value
let addDataToBlockchain = function() {
  return new Promise(function(resolve, reject) {
    let i = 0;
    let originalChain = [];
    db.createReadStream().on('data', function(data) {
        getLevelDBData(i).then((block) => {
          console.log('read stream', i, block)
          originalChain.push(block)
        })
        i++;
        }).on('error', function(err) {
            console.log('Unable to read data stream!', err)
            reject(err)
        }).on('close', function() {
          console.log('Block #' + i);
          console.log('originalChain', originalChain)
          resolve(originalChain)
      });
  });
}

exports.addLevelDBData = addLevelDBData;
exports.getLevelDBData = getLevelDBData;
exports.addDataToLevelDB = addDataToLevelDB;
exports.getAllLevelDBData = getAllLevelDBData;
exports.addDataToBlockchain = addDataToBlockchain;
/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);
