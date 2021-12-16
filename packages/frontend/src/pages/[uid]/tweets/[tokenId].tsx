import type { NextPage } from "next";
import Head from "next/head";
import { useEthers } from "@usedapp/core";
import {
  Box,
  Flex,
  Text,
  Spinner,
  useToast,
  Icon,
  FormControl,
  Textarea,
  Button,
} from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { Tweet } from "models/tweet";
import { SideBar, HeaderTabType } from "components/Sidebar";
import { TweetBox } from "components/TweetBox";
import { contractClient, contractProvider } from "utils/contract_client";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useRouter } from "next/router";
import { FlatButton } from "components/FlatButton";
import Link from "next/link";

const MainContent = () => {
  const router = useRouter();
  const toast = useToast();
  const tokenId = router.query.tokenId?.toString() || "";
  const { activateBrowserWallet, account, library } = useEthers();
  const [tweetInput, setTweetInput] = useState("");
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [comments, setComments] = useState<Tweet[]>([]);
  const [fetching, setFetching] = useState(false);
  const [posting, setPosting] = useState(false);

  const getTweet = async (tokenId: string): Promise<Tweet | null> => {
    if (library !== undefined && account) {
      const contract = contractClient(library);
      const tweet = await contract.getTweet(tokenId);
      const tweetObj = tweet as Tweet;
      return {
        ...tweetObj,
        timestamp: tweet.timestamp.toNumber() * 1000,
      };
    } else {
      console.log("Library is undefined");
      return null;
    }
  };

  const getComments = async (tokenId: string): Promise<Tweet[]> => {
    if (library !== undefined && account) {
      const contract = contractClient(library);
      const tweets = await contract.getComments(tokenId);
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

  const postComment = async (
    comment: string,
    tokenId: string
  ): Promise<boolean> => {
    if (library !== undefined && account) {
      const contract = contractClient(library);
      return await contract
        .setComment(comment, parseInt(tokenId))
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

  const updateComments = async (tokenId: string) => {
    const comments: Tweet[] = await getComments(tokenId);
    setComments(comments);
  };

  const subscribeCommented = async (tokenId: string) => {
    if (library !== undefined && account) {
      const contract = contractClient(library);
      const provider = contractProvider(library);
      const filters = contract.filters["Commented"];
      if (filters !== undefined) {
        provider.once("block", () => {
          contract.on(filters(), (author: string) => {
            updateComments(tokenId);
            if (author === account) {
              toast.closeAll();
              toast({
                title: "Comment confirmed successfully!",
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
      getTweet(tokenId)
        .then((tweet) => {
          setTweet(tweet);
        })
        .finally(() => {
          setFetching(false);
        });
      updateComments(tokenId);
      subscribeCommented(tokenId);
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
          <SideBar type={HeaderTabType.Home} account={account} />
          <Flex
            flexBasis={0}
            flexGrow={999}
            flexDir="column"
            minH="100vh"
            borderX="1px solid #eee"
          >
            <Box borderBottom="1px solid #eee">
              <Flex w="100%" px="1rem" p="1rem" borderBottom="1px solid #eee">
                <Link href={`/`} passHref>
                  <FlatButton>
                    <Icon
                      as={AiOutlineArrowLeft}
                      fontSize="1.8rem"
                      mr="1.5rem"
                      verticalAlign="middle"
                    />
                  </FlatButton>
                </Link>
                <FlatButton>
                  <Text fontSize="1.4rem" fontWeight="bold">
                    Post
                  </Text>
                </FlatButton>
              </Flex>
            </Box>
            <Box>
              {fetching || tweet == null ? (
                <Box textAlign="center" p="1rem">
                  <Spinner color="#1DA1F2" size="lg" />
                </Box>
              ) : (
                <TweetBox
                  key={tweet.timestamp}
                  tweet={tweet}
                  myAddress={`${account}`}
                  onClickLike={async () => addLike(tweet)}
                  onClickRT={async () => addLike(tweet)}
                />
              )}
            </Box>
            <Box w="100%" px="1rem" borderBottom="1px solid #eee">
              <FormControl py="1rem">
                {account ? (
                  <>
                    <Textarea
                      placeholder="Comment here..."
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
                    <Flex justifyContent="end">
                      <Button
                        colorScheme="twitter"
                        borderRadius="999px"
                        isLoading={posting}
                        onClick={async () => {
                          if (!fetching) {
                            setPosting(true);
                            const result = await postComment(
                              tweetInput,
                              tokenId
                            );
                            if (result) {
                              toast({
                                title:
                                  "Comment posted! Waiting for confirmation...",
                                position: "top",
                                status: "success",
                                duration: null,
                              });
                              setTweetInput("");
                            }
                            setPosting(false);
                          }
                        }}
                      >
                        Send
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
            <Box>
              {fetching ? (
                <Box textAlign="center" p="1rem">
                  <Spinner color="#1DA1F2" size="lg" />
                </Box>
              ) : (
                comments.map((tweet: Tweet) => (
                  <TweetBox
                    key={tweet.timestamp}
                    tweet={tweet}
                    myAddress={`${account}`}
                  />
                ))
              )}
            </Box>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

const PostDetail: NextPage = () => {
  return (
    <>
      <Head>
        <title>Twitter ETH</title>
      </Head>
      <MainContent />
    </>
  );
};

export default PostDetail;
