// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";

import "./Base64.sol";
import "./SharedStruct.sol";

/// @title TwitterUtil
/// @notice Provides a function for tweets.
library TwitterUtil {
    using Strings for uint256;
    using Base64 for bytes;

    function createERC721Token(SharedStruct.Tweet[] memory _tweets, uint256 _tokenId)
        internal
        pure
        returns (string memory)
    {
        SharedStruct.Tweet memory _tweet = _findTweet(_tweets, _tokenId);
        require(_tweet.tokenId == _tokenId, "Tweet not found.");
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    bytes(
                        abi.encodePacked(
                            '{"name":"Tweet #',
                            _tokenId.toString(),
                            '", "description":"',
                            _tweet.content,
                            '", "image": "data:image/svg+xml;base64,',
                            bytes(
                                abi.encodePacked(
                                    '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><rect width="100%" height="100%" fill="#aab8c2"></rect><switch><foreignObject x="0" y="0" width="100%" height="100%"><p xmlns="http://www.w3.org/1999/xhtml" font-size="12px" style="font-size:10px;padding:5px;">',
                                    "Tweet#",
                                    _tokenId.toString(),
                                    "<br/>",
                                    _tweet.content,
                                    '<br/><img src="',
                                    _tweet.attachment,
                                    '"/></p></foreignObject></switch></svg>'
                                )
                            ).encode(),
                            '"}'
                        )
                    ).encode()
                )
            );
    }

    function _findTweet(SharedStruct.Tweet[] memory _tweets, uint256 _tokenId)
        private
        pure
        returns (SharedStruct.Tweet memory)
    {
        SharedStruct.Tweet memory tweet;
        for (uint256 i = 0; i < _tweets.length; i++) {
            if (_tweets[i].tokenId == _tokenId) {
                tweet = _tweets[i];
            }
        }
        return tweet;
    }
}
