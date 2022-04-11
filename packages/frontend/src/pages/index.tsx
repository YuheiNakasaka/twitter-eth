import type { NextPage } from "next";
import Head from "next/head";
import { useEthers } from "@usedapp/core";
import {
  Box,
  Flex,
  Text,
  FormControl,
  Textarea,
  Spinner,
  useToast,
  Icon,
  Spacer,
  Image,
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Tweet } from "models/tweet";
import { SideBar, HeaderTabType } from "components/Sidebar";
import { TweetBox } from "components/TweetBox";
import { FlatButton } from "components/FlatButton";
import { FiImage } from "react-icons/fi";
import { AiFillCloseCircle } from "react-icons/ai";
import { contractClient, contractProvider } from "utils/contract_client";

const MainContent = () => {
  const toast = useToast();
  const { activateBrowserWallet, account, library, active } = useEthers();
  const [tweetInput, setTweetInput] = useState("");
  const [tweetInputImage, setTweetInputImage] = useState("");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [fetching, setFetching] = useState(false);
  const [posting, setPosting] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const getTimelineTweets = async (
    offset: number,
    limit: number
  ): Promise<Tweet[]> => {
    if (library !== undefined && account) {
      const contract = await contractClient(library, false);
      const tweets = await contract.getTimeline(offset, limit);
      console.log(`tweets: ${tweets}`);
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

  const postTweet = async (
    tweet: string,
    tweetInputImage: string
  ): Promise<boolean> => {
    if (library !== undefined && account) {
      const contract = await contractClient(library, true);
      return await contract
        .setTweet(tweet, tweetInputImage)
        .then(() => true)
        .catch((e) => {
          toast({
            title: "Error",
            description: `Error: ${e.message}`,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
          return false;
        });
    } else {
      console.log("Library is undefined");
      return false;
    }
  };

  const addLike = async (tweet: Tweet): Promise<boolean> => {
    if (library !== undefined && account) {
      const contract = await contractClient(library, true);
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
      const contract = await contractClient(library, true);
      return await contract
        .addRetweet(tweet.tokenId)
        .then(() => true)
        .catch((_) => false);
    } else {
      console.log("Library is undefined");
      return false;
    }
  };

  const updateTweets = async () => {
    const tweets: Tweet[] = await getTimelineTweets(0, 100);
    setTweets(tweets);
  };

  const subscribeTweeted = async () => {
    if (library !== undefined && account) {
      const contract = await contractClient(library, false);
      const provider = contractProvider(library);
      const filters = contract.filters["Tweeted"];
      if (filters !== undefined) {
        provider.once("block", () => {
          contract.on(filters(), (author: string) => {
            updateTweets();
            if (author === account) {
              console.log(`Eq: ${author}`);
              toast.closeAll();
              toast({
                title: "Tweet confirmed successfully!",
                position: "top",
                status: "success",
                isClosable: true,
              });
            }
          });
        });
      }
      return true;
    } else {
      console.log("Library is undefined");
      return false;
    }
  };

  useEffect(() => {
    if (library !== undefined && account) {
      setFetching(true);
      updateTweets().finally(() => {
        setFetching(false);
      });
      subscribeTweeted();
    }
  }, [library]);

  useEffect(() => {
    console.log(`active: ${active}`);
    if (!active) {
      setTweets([]);
    }
  }, [active]);

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
          <SideBar type={HeaderTabType.Home} account={account} />
          <Flex
            flexBasis={0}
            flexGrow={999}
            flexDir="column"
            minH="100vh"
            borderX="1px solid #eee"
          >
            <Box borderBottom="1px solid #eee">
              <Box w="100%" px="1rem" p="1rem" borderBottom="1px solid #eee">
                <Text fontSize="1.4rem" fontWeight="bold">
                  Home
                </Text>
              </Box>
              <Box w="100%" px="1rem">
                <FormControl py="1rem">
                  {account ? (
                    <>
                      <Textarea
                        placeholder="What's happening?"
                        minW="80%"
                        h="5rem"
                        fontSize="1.2rem"
                        border="0"
                        resize="none"
                        outline="none"
                        value={tweetInput}
                        focusBorderColor="transparent"
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                          setTweetInput(e.target.value);
                        }}
                      ></Textarea>
                      {tweetInputImage !== "" && (
                        <Flex justifyContent="center" my="1rem">
                          <Box>
                            <Image
                              src={tweetInputImage}
                              alt="expected image"
                              maxHeight="200px"
                            />
                            <Box textAlign="center">
                              <FlatButton
                                onClick={() => {
                                  setTweetInputImage("");
                                  if (inputFileRef.current) {
                                    inputFileRef.current.value = "";
                                  }
                                }}
                              >
                                <Icon
                                  as={AiFillCloseCircle}
                                  fontSize="2rem"
                                  color="#000000"
                                />
                              </FlatButton>
                            </Box>
                          </Box>
                        </Flex>
                      )}
                      <Flex justifyContent="end">
                        <input
                          type="file"
                          accept="image/*"
                          ref={inputFileRef}
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const dataUri = `${reader.result}`;
                                setTweetInputImage(`${dataUri}`);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <FlatButton
                          onClick={() => {
                            if (inputFileRef.current) {
                              inputFileRef.current.click();
                            }
                          }}
                        >
                          <Icon
                            as={FiImage}
                            fontSize="1.6rem"
                            color="#1DA1F2"
                          />
                        </FlatButton>
                        <FlatButton>
                          <Text fontSize="0.8rem" color="gray.400">
                            tiny image only
                          </Text>
                        </FlatButton>
                        <Spacer />
                        <Button
                          colorScheme="twitter"
                          borderRadius="999px"
                          isLoading={posting}
                          onClick={async () => {
                            if (!fetching) {
                              setPosting(true);
                              const result = await postTweet(
                                tweetInput,
                                tweetInputImage
                              );
                              if (result) {
                                toast({
                                  title:
                                    "Tweet posted! Waiting for confirmation...",
                                  position: "top",
                                  status: "success",
                                  duration: null,
                                });
                                setTweetInput("");
                                setTweetInputImage("");
                              }
                              setPosting(false);
                            }
                          }}
                        >
                          Tweet
                        </Button>
                      </Flex>
                    </>
                  ) : (
                    <>
                      <Flex justifyContent="center">
                        <Button
                          colorScheme="twitter"
                          borderRadius="999px"
                          onClick={() => {
                            activateBrowserWallet();
                          }}
                        >
                          Connect Wallet!
                        </Button>
                      </Flex>
                    </>
                  )}
                </FormControl>
              </Box>
            </Box>
            <Box>
              {fetching ? (
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
                    onClickComment={async () =>
                      new Promise((resolve) => {
                        resolve(true);
                      })
                    }
                  />
                ))
              )}
              {!active && !account && (
                <Box position="relative" w="100%" pt="56.25%">
                  <iframe
                    src="https://www.youtube.com/embed/Sj0kGnNSmKY"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      width: "100%",
                      height: "100%",
                    }}
                  ></iframe>
                </Box>
              )}
            </Box>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Twitter ETH</title>
      </Head>
      <MainContent />
    </>
  );
};

export default Home;
