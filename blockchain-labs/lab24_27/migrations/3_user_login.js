const UserLogin = artifacts.require("UserLogin");

module.exports = function (deployer) {
  deployer.deploy(UserLogin);
};
