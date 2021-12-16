//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./TwitterValidation.sol";
import "./TwitterUtil.sol";
import "./SharedStruct.sol";

contract TwitterV1 is Initializable, ERC721Upgradeable {
    using TwitterValidation for string;
    using TwitterUtil for SharedStruct.Tweet[];
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    // For global access
    SharedStruct.Tweet[] public tweets;
    mapping(address => SharedStruct.User) public users;

    // For specifil tweet
    mapping(uint256 => SharedStruct.Tweet[]) public comments;

    // For specific users
    mapping(address => SharedStruct.User[]) public followings;
    mapping(address => SharedStruct.User[]) public followers;
    mapping(address => SharedStruct.Tweet[]) public likes;

    event Tweeted(address indexed sender);
    event Commented(address indexed sender);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {
        __ERC721_init("TwitterETH", "TWTE");
    }

    function initialize() public initializer {}

    // Set tweet to storage and mint it as NFT. Text tweets and image tweets are supported. Tweet can not be deleted by anyone.
    function setTweet(string memory _tweet, string memory _imageData) public virtual {
        uint256 supply = _tokenIdTracker.current();

        string memory iconUrl;
        if (bytes(users[msg.sender].iconUrl).length > 0) {
            iconUrl = users[msg.sender].iconUrl;
        }

        SharedStruct.Tweet memory tweet;
        tweet.tokenId = supply + 1;
        tweet.content = _tweet;
        tweet.author = msg.sender;
        tweet.timestamp = block.timestamp;
        tweet.iconUrl = iconUrl;
        if (bytes(_imageData).length > 0) {
            tweet.attachment = _imageData;
        } else {
            require(bytes(_tweet).length > 0);
            require(_tweet.noSpace());
        }
        tweets.push(tweet);
        _tokenIdTracker.increment();
        _safeMint(msg.sender, supply + 1);

        emit Tweeted(msg.sender);
    }

    function getTimeline(int256 offset, int256 limit) public view virtual returns (SharedStruct.Tweet[] memory) {
        require(offset >= 0);

        if (uint256(offset) > tweets.length) {
            return new SharedStruct.Tweet[](0);
        }

        int256 tweetLength = int256(tweets.length);
        int256 length = tweetLength - offset > limit ? limit : tweetLength - offset;
        SharedStruct.Tweet[] memory result = new SharedStruct.Tweet[](uint256(length));
        uint256 idx = 0;
        for (int256 i = length - offset - 1; length - offset - limit <= i; i--) {
            if (i <= length - offset - 1 && length - offset - limit <= i && i >= 0) {
                result[idx] = tweets[uint256(i)];
                idx++;
            }
        }
        return result;
    }

    // Get user's tweets and retweets.
    function getUserTweets(address _address) public view virtual returns (SharedStruct.Tweet[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < tweets.length; i++) {
            // original own tweets and own retweeted tweets
            if ((tweets[i].author == _address && tweets[i].retweetedBy == address(0)) || tweets[i].retweetedBy == _address) {
                count++;
            }
        }

        SharedStruct.Tweet[] memory result = new SharedStruct.Tweet[](count);
        uint256 idx = 0;
        for (int256 i = int256(tweets.length - 1); 0 <= i; --i) {
            if ((tweets[uint256(i)].author == _address && tweets[uint256(i)].retweetedBy == address(0)) || tweets[uint256(i)].retweetedBy == _address) {
                result[idx] = tweets[uint256(i)];
                idx++;
            }
        }

        return result;
    }

    // Get original tweet without retweets.
    function getTweet(uint256 _tokenId) public view virtual returns (SharedStruct.Tweet memory) {
        SharedStruct.Tweet memory result;
        if (tweets.length == 0) {
            return result;
        }
        for (uint256 i = 0; i < tweets.length; i++) {
            if (tweets[i].tokenId == _tokenId && tweets[i].retweetedBy == address(0)) {
                result = tweets[i];
                break;
            }
        }
        return result;
    }

    function follow(address _address) public virtual {
        require(_address != msg.sender);

        string memory myIconUrl;
        string memory otherIconUrl;
        if (bytes(users[msg.sender].iconUrl).length > 0) {
            myIconUrl = users[msg.sender].iconUrl;
        }
        if (bytes(users[_address].iconUrl).length > 0) {
            otherIconUrl = users[_address].iconUrl;
        }

        bool _exists;
        for (uint256 i = 0; i < followings[msg.sender].length; i++) {
            if (followings[msg.sender][i].id == _address) {
                _exists = true;
            }
        }
        if (!_exists) {
            followings[msg.sender].push(SharedStruct.User({id: _address, iconUrl: otherIconUrl}));
        }

        _exists = false;
        for (uint256 i = 0; i < followers[_address].length; i++) {
            if (followers[_address][i].id == msg.sender) {
                _exists = true;
            }
        }
        if (!_exists) {
            followers[_address].push(SharedStruct.User({id: msg.sender, iconUrl: myIconUrl}));
        }
    }

    function unfollow(address _address) public virtual {
        require(_address != msg.sender);

        for (uint256 i = 0; i < followings[msg.sender].length; i++) {
            if (followings[msg.sender][i].id == _address) {
                for (uint256 j = i; j < followings[msg.sender].length - 1; j++) {
                    followings[msg.sender][j] = followings[msg.sender][j + 1];
                }
                followings[msg.sender].pop();
            }
        }

        for (uint256 i = 0; i < followers[_address].length; i++) {
            if (followers[_address][i].id == msg.sender) {
                for (uint256 j = i; j < followers[_address].length - 1; j++) {
                    followers[_address][j] = followers[_address][j + 1];
                }
                followers[_address].pop();
            }
        }
    }

    function getFollowings(address _address) public view virtual returns (SharedStruct.User[] memory) {
        return followings[_address];
    }

    function getFollowers(address _address) public view virtual returns (SharedStruct.User[] memory) {
        return followers[_address];
    }

    function isFollowing(address _address) public view virtual returns (bool) {
        bool _exists = false;
        for (uint256 i = 0; i < followings[msg.sender].length; i++) {
            if (followings[msg.sender][i].id == _address) {
                _exists = true;
            }
        }
        return _exists;
    }

    // Like is kept forever. can not be removed.
    function addLike(uint256 _tokenId) public virtual {
        // Avoid duplicate likes.
        for (uint256 i = 0; i < likes[msg.sender].length; i++) {
            if (likes[msg.sender][i].tokenId == _tokenId) {
                return;
            }
        }

        for (uint256 i = 0; i < tweets.length; i++) {
            if (tweets[i].tokenId == _tokenId) {
                tweets[i].likes.push(msg.sender);
                likes[msg.sender].push(tweets[i]);
            }
        }
    }

    // Get my like's tweets.
    function getLikes(address _address) public view virtual returns (SharedStruct.Tweet[] memory) {
        return likes[_address];
    }

    // Retweet is kept forever. can not be removed.
    // It's possible to retweet many times.
    function addRetweet(uint256 _tokenId) public virtual {
        SharedStruct.Tweet memory myRetweet;
        for (uint256 i = 0; i < tweets.length; i++) {
            if (tweets[i].tokenId == _tokenId) {
                tweets[i].retweets.push(msg.sender);
                myRetweet = tweets[i];
                myRetweet.retweetedBy = msg.sender;
                break;
            }
        }
        tweets.push(myRetweet);
        emit Tweeted(msg.sender);
    }

    // Get icon.
    function getUserIcon(address _address) public view virtual returns (string memory) {
        return users[_address].iconUrl;
    }

    // Change iconUrl of user.
    // Anyone can set up any iconUrl which is not own NFT...
    function changeIconUrl(string memory _url) public virtual {
        users[msg.sender].id = msg.sender;
        users[msg.sender].iconUrl = _url;
    }

    // Add comment to specific tweet.
    function setComment(string memory _comment, uint256 _tokenId) public virtual {
        uint256 supply = _tokenIdTracker.current();
        require(_tokenId <= supply);

        string memory iconUrl;
        if (bytes(users[msg.sender].iconUrl).length > 0) {
            iconUrl = users[msg.sender].iconUrl;
        }

        SharedStruct.Tweet memory comment;

        require(bytes(_comment).length > 0);
        require(_comment.noSpace());
        comment.tokenId = _tokenId;
        comment.content = _comment;
        comment.author = msg.sender;
        comment.timestamp = block.timestamp;
        comment.iconUrl = iconUrl;
        comments[_tokenId].push(comment);

        emit Commented(msg.sender);
    }

    // Get comments of specific tweet.
    function getComments(uint256 _tokenId) public view virtual returns (SharedStruct.Tweet[] memory) {
        return comments[_tokenId];
    }

    // @override tokenURI returns ERC721 tokenData as base64 encoded json string
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId));
        return tweets.createERC721Token(_tokenId);
    }
}
