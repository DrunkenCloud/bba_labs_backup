// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserLogin {
    mapping(address => string) private usernames;

    function signup(string memory _username) public {
        require(bytes(usernames[msg.sender]).length == 0, "Already signed up");
        usernames[msg.sender] = _username;
    }

    function getMyUsername() public view returns (string memory) {
        return usernames[msg.sender];
    }
}
