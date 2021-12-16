const { expect } = require("chai");
const { assert } = require("console");
const { ethers } = require("hardhat");

describe("Twitter", function () {
  describe("setTweet", function () {
    it("Should return error", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();
      await expect(twitter.setTweet("     ")).to.be.reverted;
    });
  });

  describe("getTimeline", function () {
    it("Should return the tweet", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      const tx = await twitter.setTweet("Hello, world!", "");
      await tx.wait();
      const tweets = await twitter.getTimeline(0, 10);
      const tweet = tweets[0];
      expect(tweet.content).to.equal("Hello, world!");
      expect(tweet.author).to.equal(owner.address);
    });
  });

  describe("getUserTweets", function () {
    it("Should return the tweets order by timestamp desc", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.setTweet("Hello, world!", "");
      await tx.wait();
      tx = await twitter.setTweet("Hello, new world!", "");
      await tx.wait();

      const tweets = await twitter.getUserTweets(owner.address);
      const tweet = tweets[0];
      expect(tweet.content).to.equal("Hello, new world!");
      expect(tweet.author).to.equal(owner.address);
    });

    it("Should return the tweet", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.setTweet(
        "Hello, world!",
        "data:image/png;base64,XXXX"
      );
      await tx.wait();

      const tweets = await twitter.getUserTweets(owner.address);
      const tweet = tweets[0];
      expect(tweet.content).to.equal("Hello, world!");
      expect(tweet.author).to.equal(owner.address);
      expect(tweet.attachment).to.equal("data:image/png;base64,XXXX");
    });
  });

  describe("getTweet", function () {
    it("Should return the tweet", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.setTweet("Hello, world!", "");
      await tx.wait();

      const tweet = await twitter.getTweet(1);
      expect(tweet.content).to.equal("Hello, world!");
      expect(tweet.author).to.equal(owner.address);
    });
  });

  describe("follow", function () {
    it("Should follow user", async function () {
      const [owner, user] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.follow(user.address);
      await tx.wait();

      const followings = await twitter.getFollowings(owner.address);
      const following = followings[0];
      expect(following.id).to.equal(user.address);

      const followers = await twitter.getFollowers(user.address);
      const follower = followers[0];
      expect(follower.id).to.equal(owner.address);
    });
  });

  describe("getFollowings", function () {
    it("Should unfollow user", async function () {
      const [owner, user, user2] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.follow(user.address);
      await tx.wait();
      tx = await twitter.follow(user2.address);
      await tx.wait();

      let followings = await twitter.getFollowings(owner.address);
      expect(followings.length).to.equal(2);
      let followers = await twitter.getFollowers(user.address);
      expect(followers.length).to.equal(1);
      followers = await twitter.getFollowers(user2.address);
      expect(followers.length).to.equal(1);

      tx = await twitter.unfollow(user.address);
      await tx.wait();
      followings = await twitter.getFollowings(owner.address);
      expect(followings.length).to.equal(1);
      followers = await twitter.getFollowers(user.address);
      expect(followers.length).to.equal(0);
      followers = await twitter.getFollowers(user2.address);
      expect(followers.length).to.equal(1);
    });
  });

  describe("isFollowing", function () {
    it("Should true if follow the address", async function () {
      const [owner, user] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.follow(user.address);
      await tx.wait();

      const following = await twitter.isFollowing(user.address);
      expect(following).to.equal(true);
    });
  });

  describe("addLike", function () {
    it("Should add a like to the tweet", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.setTweet("Hello, world!", "");
      await tx.wait();

      let tweets = await twitter.getUserTweets(owner.address);
      let tweet = tweets[0];
      expect(tweet.likes.includes(owner.address)).to.be.false;

      tx = await twitter.addLike(tweet.tokenId);
      await tx.wait();
      tweets = await twitter.getUserTweets(owner.address);
      tweet = tweets[0];
      expect(tweet.likes.includes(owner.address)).to.be.true;
    });
  });

  describe("getLikes", function () {
    it("Should return liked tweets", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.setTweet("Hello, world!", "");
      await tx.wait();

      let tweets = await twitter.getLikes(owner.address);
      expect(tweets.length).to.equal(0);

      tweets = await twitter.getUserTweets(owner.address);
      let tweet = tweets[0];

      tx = await twitter.addLike(tweet.tokenId);
      await tx.wait();

      tweets = await twitter.getLikes(owner.address);
      tweet = tweets[0];
      expect(tweet.likes.includes(owner.address)).to.be.true;
    });
  });

  describe("changeIconUrl/getUserIcon", function () {
    it("Should change icon url", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let url = await twitter.getUserIcon(owner.address);
      expect(url).to.equal("");

      let tx = await twitter.changeIconUrl("https://example.com/icon.png");
      await tx.wait();

      url = await twitter.getUserIcon(owner.address);
      expect(url).to.equal("https://example.com/icon.png");
    });
  });

  describe("setComment/getComments", function () {
    it("Should add the comment", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.setTweet("Hello, world!", "");
      await tx.wait();

      tx = await twitter.setComment("Hello, comment!", 1);
      await tx.wait();

      const comments = await twitter.getComments(1);
      const comment = comments[0];
      expect(comment.content).to.equal("Hello, comment!");
      expect(comment.author).to.equal(owner.address);
    });
  });

  describe("addRetweet", function () {
    it("Should add the comment", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.setTweet("Hello, world!", "");
      await tx.wait();

      await twitter.addRetweet(1);
      await tx.wait();

      let tweets = await twitter.getTimeline(0, 2);
      expect(tweets[1].retweets.includes(owner.address)).to.be.true;
      expect(tweets[1].retweetedBy).to.eq(
        "0x0000000000000000000000000000000000000000"
      );
      expect(tweets[0].retweets.includes(owner.address)).to.be.true;
      expect(tweets[0].retweetedBy).to.eq(owner.address);
    });
  });

  describe("tokenURI", function () {
    it("Should return base64 encoded string", async function () {
      const [owner] = await ethers.getSigners();
      const Twitter = await ethers.getContractFactory("TwitterV1");
      const twitter = await Twitter.deploy();
      await twitter.deployed();

      let tx = await twitter.setTweet("Hello, world!", "");
      await tx.wait();

      const tokenURI = await twitter.tokenURI(1);
      expect(tokenURI).to.eq(
        "data:application/json;base64,eyJuYW1lIjoiVHdlZXQgIzEiLCAiZGVzY3JpcHRpb24iOiJIZWxsbywgd29ybGQhIiwgImltYWdlIjogImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaUlIQnlaWE5sY25abFFYTndaV04wVW1GMGFXODlJbmhOYVc1WlRXbHVJRzFsWlhRaUlIWnBaWGRDYjNnOUlqQWdNQ0F6TlRBZ016VXdJajQ4Y21WamRDQjNhV1IwYUQwaU1UQXdKU0lnYUdWcFoyaDBQU0l4TURBbElpQm1hV3hzUFNJallXRmlPR015SWo0OEwzSmxZM1ErUEhOM2FYUmphRDQ4Wm05eVpXbG5iazlpYW1WamRDQjRQU0l3SWlCNVBTSXdJaUIzYVdSMGFEMGlNVEF3SlNJZ2FHVnBaMmgwUFNJeE1EQWxJajQ4Y0NCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TVRrNU9TOTRhSFJ0YkNJZ1ptOXVkQzF6YVhwbFBTSXhNbkI0SWlCemRIbHNaVDBpWm05dWRDMXphWHBsT2pFd2NIZzdjR0ZrWkdsdVp6bzFjSGc3SWo1VWQyVmxkQ014UEdKeUx6NUlaV3hzYnl3Z2QyOXliR1FoUEdKeUx6NDhhVzFuSUhOeVl6MGlJaTgrUEM5d1Bqd3ZabTl5WldsbmJrOWlhbVZqZEQ0OEwzTjNhWFJqYUQ0OEwzTjJaejQ9In0="
      );
    });
  });
});
