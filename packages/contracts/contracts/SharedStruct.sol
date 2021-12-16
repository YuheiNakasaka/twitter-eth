// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title SharedStruct
/// @notice Provides a struct for twitter.
library SharedStruct {
    struct User {
        address id;
        string iconUrl;
    }

    struct Tweet {
        uint256 tokenId;
        string content;
        address author;
        uint256 timestamp;
        string attachment;
        address[] likes; // want to use User[] but not supported yet.
        address[] retweets;
        string iconUrl;
        address retweetedBy;
    }
}
