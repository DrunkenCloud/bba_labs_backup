const AccessLogger = artifacts.require("AccessLogger");

module.exports = function (deployer) {
  deployer.deploy(AccessLogger);
};