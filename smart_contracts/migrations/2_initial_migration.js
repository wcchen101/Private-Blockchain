var StarNotary = artifacts.require("../contracts/StarNotary.sol");

module.exports = function(deployer) {
  deployer.deploy(StarNotary);
};
