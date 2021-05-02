// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface CallerContracInterface {
    function callback(uint256 _ethPrice, uint256 id) external;
}
