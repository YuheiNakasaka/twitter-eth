import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEthers } from "@usedapp/core";
import {
  Box,
  Flex,
  Text,
  Spinner,
  chakra,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { useEffect, useRef, useState } from "react";
import { Tweet } from "models/tweet";
import { SideBar, HeaderTabType } from "components/Sidebar";
import { TweetBox } from "components/TweetBox";
import { FlatButton } from "components/FlatButton";
import { useGetNFTs } from "hooks/useGetNFTs";
import { useRouter } from "next/router";
import { contractClient } from "utils/contract_client";
import { BsPersonCircle } from "react-icons/bs";
import { NFTMetaData } from "models/nft";
import { CircleAvatar } from "components/CircleAvatar";

const MainContent = () => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const getNFTs = useGetNFTs();
  const uid = router.query.uid?.toString() || "";
  const { account, library } = useEthers();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [followings, setFollowings] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [nfts, setNFTs] = useState<string[]>([]);
  const [profileIcon, setProfileIcon] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner, setIsOnwer] = useState(false);
  const [fetchingTweet, setFetchingTweet] = useState(false);
  const [fetchingNFTs, setFetchingNFTs] = useState(false);

  const getUserTweets = async (address: string): Promise<Tweet[]> => {
    if (library !== undefined) {
      const contract = contractClient(library);
      const tweets = await contract.getUserTweets(address);
      return tweets.map((tweet: any) => {
        const tweetObj = tweet as Tweet;
        return {
          ...tweetObj,
          timestamp: tweet.timestamp.toNumber() * 1000,
        };
      });
    } else {
      console.log("Library is undefined");
      return [];
    }
  };

  const getFollowers = async (address: string): Promise<number> => {
    if (library !== undefined) {
      const contract = contractClient(library);
      const followers = await contract.getFollowers(address);
      return followers?.length || 0;
    } else {
      console.log("Library is undefined");
      return 0;
    }
  };

  const getFollowings = async (address: string): Promise<number> => {
    if (library !== undefined) {
      const contract = contractClient(library);
      const followings = await contract.getFollowings(address);
      return followings?.length || 0;
    } else {
      console.log("Library is undefined");
      return 0;
    }
  };

  const follow = async (address: string): Promise<boolean> => {
    if (library !== undefined) {
      const contract = contractClient(library);
      await contract.follow(address);
      return true;
    } else {
      console.log("Library is undefined");
      return false;
    }
  };

  const unfollow = async (address: string): Promise<boolean> => {
    if (library !== undefined) {
      const contract = contractClient(library);
      await contract.unfollow(address);
      return true;
    } else {
      console.log("Library is undefined");
      return false;
    }
  };

  const following = async (address: string): Promise<boolean> => {
    if (library !== undefined) {
      const contract = contractClient(library);
      return await contract.isFollowing(address);
    } else {
      console.log("Library is undefined");
      return false;
    }
  };

  const addLike = async (tweet: Tweet): Promise<boolean> => {
    if (library !== undefined && account) {
      const contract = contractClient(library);
      return await contract
        .addLike(tweet.tokenId)
        .then(() => true)
        .catch((_) => false);
    } else {
      console.log("Library is undefined");
      return false;
    }
  };

  const addRT = async (tweet: Tweet): Promise<boolean> => {
    if (library !== undefined && account) {
      const contract = contractClient(library);
      return await contract
        .addRetweet(tweet.tokenId)
        .then(() => true)
        .catch((_) => false);
    } else {
      console.log("Library is undefined");
      return false;
    }
  };

  const getLikes = async (address: string): Promise<number> => {
    if (library !== undefined) {
      const contract = contractClient(library);
      const likes = await contract.getLikes(address);
      return likes?.length || 0;
    } else {
      console.log("Library is undefined");
      return 0;
    }
  };

  const changeIcon = async (iconUrl: string): Promise<boolean> => {
    if (library !== undefined) {
      const contract = contractClient(library);
      await contract.changeIconUrl(iconUrl);
      return true;
    } else {
      console.log("Library is undefined");
      return false;
    }
  };

  const getUserIcon = async (address: string): Promise<string> => {
    if (library !== undefined) {
      const contract = contractClient(library);
      const url = await contract.getUserIcon(address);
      return url;
    } else {
      console.log("Library is undefined");
      return "";
    }
  };

  const loadUserTweets = async (address: string) => {
    const tweets: Tweet[] = await getUserTweets(address);
    setTweets(tweets);
  };

  useEffect(() => {
    if (library !== undefined && uid !== "") {
      setFetchingTweet(true);
      following(uid).then((status) => {
        setIsFollowing(status);
      });
      getFollowers(uid).then((count) => {
        setFollowers(count);
      });
      getFollowings(uid).then((count) => {
        setFollowings(count);
      });
      loadUserTweets(uid).finally(() => {
        setFetchingTweet(false);
      });
      getLikes(uid).then((likes) => {
        setLikes(likes);
      });
      getUserIcon(uid).then((url) => {
        setProfileIcon(url);
      });
      setIsOnwer(account?.toLowerCase() === uid.toLowerCase());
    }
  }, [library]);

  return (
    <>
      <Box w="100vw" minH="100vh">
        <Flex
          flexWrap="wrap"
          maxW={{
            base: "100vw",
            lg: "60vw",
            xl: "60vw",
          }}
          m="0 auto"
        >
          <SideBar type={HeaderTabType.Profile} account={account} />
          <Flex
            flexBasis={0}
            flexGrow={999}
            flexDir="column"
            minH="100vh"
            borderX="1px solid #eee"
          >
            <Box borderBottom="1px solid #eee">
              <Flex justifyContent="center" w="100%" px="1rem" p="1rem">
                <FlatButton
                  onClick={async () => {
                    if (uid === account) {
                      setFetchingNFTs(true);
                      onOpen();
                      getNFTs(
                        `${account}`,
                        `${process.env.NEXT_PUBLIC_CHAIN_ID}`
                      )
                        .then((items) => {
                          const nfts = items.result.map((item) => {
                            const metadata = item.metadata as NFTMetaData;
                            return metadata.image;
                          });
                          setNFTs([...nfts]);
                        })
                        .catch((err) => console.log(err))
                        .finally(() => {
                          setFetchingNFTs(false);
                        });
                    }
                  }}
                >
                  {profileIcon !== "" ? (
                    <CircleAvatar iconUrl={profileIcon} size="5rem" />
                  ) : (
                    <Icon as={BsPersonCircle} fontSize="5rem" />
                  )}
                </FlatButton>
              </Flex>
              <Box w="100%" px="1rem" p="1rem">
                <Text fontSize="1.4rem" fontWeight="bold">
                  Profile
                </Text>
                <Text fontSize="0.5rem" isTruncated>
                  {uid}
                </Text>
              </Box>
              <Box w="100%" px="1rem" p="1rem">
                <Flex mb="1rem">
                  <Box>
                    <Link href={`/${uid}/followings`} passHref>
                      <FlatButton>
                        <Text>
                          {followings}{" "}
                          <chakra.span color="rgb(83, 100, 113)">
                            followings
                          </chakra.span>
                        </Text>
                      </FlatButton>
                    </Link>
                  </Box>
                  <Box ml="1rem">
                    <Link href={`/${uid}/followers`} passHref>
                      <FlatButton onClick={() => {}}>
                        <Text>
                          {followers}{" "}
                          <chakra.span color="rgb(83, 100, 113)">
                            followers
                          </chakra.span>
                        </Text>
                      </FlatButton>
                    </Link>
                  </Box>
                  <Box ml="1rem">
                    <Link href={`/${uid}/likes`} passHref>
                      <FlatButton onClick={() => {}}>
                        <Text>
                          {likes}{" "}
                          <chakra.span color="rgb(83, 100, 113)">
                            likes
                          </chakra.span>
                        </Text>
                      </FlatButton>
                    </Link>
                  </Box>
                </Flex>
                {account && !isOwner && !fetchingTweet && (
                  <Box textAlign="center">
                    {isFollowing ? (
                      <Button
                        borderRadius="999px"
                        onClick={() => {
                          unfollow(uid).then((_) => {
                            setIsFollowing(false);
                          });
                        }}
                      >
                        Unfollow
                      </Button>
                    ) : (
                      <Button
                        color="white"
                        bg="rgb(15, 20, 25)"
                        borderRadius="999px"
                        _hover={{ bg: "rgb(45, 50, 55)" }}
                        onClick={() => {
                          follow(uid).then((_) => {
                            setIsFollowing(true);
                          });
                        }}
                      >
                        Follow
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            <Box>
              {fetchingTweet ? (
                <Box textAlign="center" p="1rem">
                  <Spinner color="#1DA1F2" size="lg" />
                </Box>
              ) : (
                tweets.map((tweet: Tweet, i: number) => (
                  <TweetBox
                    key={`${tweet.timestamp}_${i}`}
                    tweet={tweet}
                    myAddress={`${account}`}
                    onClickLike={async () => addLike(tweet)}
                    onClickRT={async () => addRT(tweet)}
                  />
                ))
              )}
            </Box>
          </Flex>
        </Flex>
      </Box>

      <Modal
        onClose={onClose}
        finalFocusRef={btnRef}
        isOpen={isOpen}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select your icon</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexWrap="wrap" justifyContent="center">
              {!fetchingNFTs ? (
                nfts.map((nft, i) => (
                  <Box
                    key={`${nft}_${i}`}
                    m="1em"
                    style={{ display: "inline-block" }}
                  >
                    <FlatButton
                      onClick={async () => {
                        const resp = await changeIcon(nft);
                        if (resp) {
                          setProfileIcon(nft);
                        }
                      }}
                    >
                      <CircleAvatar iconUrl={nft} size="150px" />
                    </FlatButton>
                  </Box>
                ))
              ) : (
                <Box textAlign="center" p="1rem">
                  <Spinner color="#1DA1F2" size="lg" />
                  <Text>Searching your NFTs...</Text>
                </Box>
              )}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const Profile: NextPage = () => {
  return (
    <>
      <Head>
        <title>Twitter ETH</title>
      </Head>
      <MainContent />
    </>
  );
};

export default Profile;
