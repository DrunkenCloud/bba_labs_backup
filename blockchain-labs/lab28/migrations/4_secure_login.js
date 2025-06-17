const SecureLogin = artifacts.require("SecureLogin");

module.exports = function (deployer) {
  deployer.deploy(SecureLogin);
};
