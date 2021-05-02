// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CallerContractInterface.sol";

/// @notice Eth price oracle
/// @dev Sets and retrieves ETH price
contract EthPriceOracle is Ownable {
    uint private randNonce = 0;
    uint private modulus = 1000;
    mapping(uint256 => bool) pendingRequests;

    event GetLatestEthPriceEvent(address callerAddress, uint id);
    event SetLatestEthPriceEvent(uint256 ethPrice, address callerAddress);

    /// @notice Sets new request for retrieving eth price
    /// @dev Sets new pendingRequest for retrieving eth price
    /// @return uint256 Identifier of the request
    function getLatestEthPrice() public returns (uint256) {
        randNonce++;
        uint id = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % modulus;
        pendingRequests[id] = true;

        emit GetLatestEthPriceEvent(msg.sender, id);
        return id;
    }

    /// @notice Sets latest price of the eth
    /// @dev Sets latest price of eth by calling caller contract
    /// @param _ethPrice Current price of the ETH
    /// @param _callerAddress Address of the caller contract
    /// @param _id Identifier of the request
    function setLatestEthPrice(
        uint256 _ethPrice,
        address _callerAddress,
        uint256 _id
    ) public onlyOwner {
        require(pendingRequests[_id], "request is not on pending list");
        delete pendingRequests[_id];

        CallerContracInterface callerContractInstance = CallerContracInterface(_callerAddress);
        callerContractInstance.callback(_ethPrice, _id);

        emit SetLatestEthPriceEvent(_ethPrice, _callerAddress);
    }
}
