// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessLogger {
    struct AccessLog {
        string userId;
        string action;
        uint256 timestamp;
    }
    
    AccessLog[] public accessLogs;
    
    event AccessLogged(string userId, string action, uint256 timestamp);
    
    function logAccess(string memory _userId, string memory _action, uint256 _timestamp) public {
        accessLogs.push(AccessLog({
            userId: _userId,
            action: _action,
            timestamp: _timestamp
        }));
        
        emit AccessLogged(_userId, _action, _timestamp);
    }
    
    function getLogCount() public view returns (uint256) {
        return accessLogs.length;
    }
    
    function getLog(uint256 _index) public view returns (string memory, string memory, uint256) {
        require(_index < accessLogs.length, "Index out of bounds");
        AccessLog memory log = accessLogs[_index];
        return (log.userId, log.action, log.timestamp);
    }
}