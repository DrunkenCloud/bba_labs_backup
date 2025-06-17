// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecureLogin {
    mapping(bytes32 => bytes32) private users;

    function register(bytes32 usernameHash, bytes32 passwordHash) public {
        require(users[usernameHash] == 0, "User exists");
        users[usernameHash] = passwordHash;
    }

    function login(bytes32 usernameHash, bytes32 passwordHash) public view returns (bool) {
        return users[usernameHash] == passwordHash;
    }
}
