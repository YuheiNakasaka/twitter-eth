// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title TwitterValidation
/// @notice Provides a function for validating a tweet.
library TwitterValidation {
    function noSpace(string memory _tweet) internal pure returns (bool) {
        bool _isOnlySpace = true;
        for (uint256 i = 0; i < bytes(_tweet).length; i++) {
            bytes1 rune = bytes(_tweet)[i];
            if (rune != bytes1(" ")) {
                _isOnlySpace = false;
                break;
            }
        }
        return !_isOnlySpace;
    }
}
