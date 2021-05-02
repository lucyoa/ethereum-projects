// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./EthPriceOracleInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CallerContract
/// @notice Example contract that uses oracle to fetch eth price
/// @dev Uses external oracle to fetch eth price
contract CallerContract is Ownable {
    uint256 public ethPrice; 
    address public oracleAddress;
    mapping(uint256=>bool) myRequests;
    EthPriceOracleInterface private oracleInstance;

    event NewOracleAddressEvent(address oracleAddress);
    event ReceivedNewRequestIdEvent(uint256 id);
    event PriceUpdatedEvent(uint256 ethPrice, uint256 id);

    /// @notice Sets oracle smart contract address
    /// @dev Sets oracle smart contract address and emits new oracle address event
    /// @param _oracleInstanceAddress Address of the oracle smart contract
    function setOracleInstanceAddress(address _oracleInstanceAddress) public onlyOwner {
        oracleAddress = _oracleInstanceAddress;
        oracleInstance = EthPriceOracleInterface(oracleAddress);

        emit NewOracleAddressEvent(oracleAddress);
    }

    /// @notice Updates Eth Price
    /// @dev Updates Eth Price by trigger oracleInstance
    function updateEthPrice() public {
        uint256 id = oracleInstance.getLatestEthPrice();
        myRequests[id] = true;

        emit ReceivedNewRequestIdEvent(id);
    }

    /// @notice Callback invoked by oracle that sets latest eth price
    /// @dev Callback invoked by oracle that sets latest eth price and emits PriceUpdateEvent
    /// @param _ethPrice Eth price
    /// @param _id Request identifier
    function callback(uint256 _ethPrice, uint256 _id) public onlyOracle {
        require(myRequests[_id], "request is not in the pending list");

        ethPrice = _ethPrice;
        delete myRequests[_id];

        emit PriceUpdatedEvent(_ethPrice, _id);
    }

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "not authorized to call this function");
        _;
    }
}
