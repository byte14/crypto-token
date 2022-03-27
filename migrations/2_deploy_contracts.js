const CryptoToken = artifacts.require("./CryptoToken.sol");

module.exports = function (deployer) {
  deployer.deploy(CryptoToken, 1000000);
};
