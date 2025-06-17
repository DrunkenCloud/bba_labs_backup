// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserLogin {
    mapping(string => string) private users;

    function register(string memory username, string memory password) public {
        require(bytes(users[username]).length == 0, "User already exists");
        users[username] = password;
    }

    function login(string memory username, string memory password) public view returns (bool) {
        return keccak256(bytes(users[username])) == keccak256(bytes(password));
    }
}
