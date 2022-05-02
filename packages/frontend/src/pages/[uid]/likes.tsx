import type { NextPage } from "next";
import Head from "next/head";
import { useEthers } from "@usedapp/core";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SideBar, HeaderTabType } from "components/Sidebar";
import { useRouter } from "next/router";
import { contractClient } from "utils/contract_client";
import { TweetBox } from "components/TweetBox";
import { Tweet } from "models/tweet";

const MainContent = () => {
  const router = useRouter();
  const uid = router.query.uid?.toString() || "";
  const { account, library } = useEthers();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [fetching, setFetching] = useState(false);

  const getLikes = async (address: string): Promise<Tweet[]> => {
    if (library !== undefined) {
      const contract = await contractClient(library, false);
      const likes = await contract.getLikes(address);
      return likes.map((tweet) => {
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

  useEffect(() => {
    if (library !== undefined && uid !== "") {
      setFetching(true);
      getLikes(uid)
        .then((tweet) => {
          setTweets(tweet);
        })
        .finally(() => {
          setFetching(false);
        });
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
              <Box w="100%" px="1rem" p="1rem">
                <Text fontSize="1.4rem" fontWeight="bold">
                  Likes
                </Text>
                <Text fontSize="0.5rem" isTruncated>
                  {uid}
                </Text>
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

const Likes: NextPage = () => {
  return (
    <>
      <Head>
        <title>Twitter ETH</title>
      </Head>
      <MainContent />
    </>
  );
};

export default Likes;
