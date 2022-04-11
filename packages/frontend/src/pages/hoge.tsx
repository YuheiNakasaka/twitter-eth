import { NextPage } from "next";
import Head from "next/head";
import { Contract, Web3Provider, Provider } from "zksync-web3";
import ABI from "resources/contract-abi.json";
import { useEffect } from "react";
import { Button } from "@chakra-ui/react";

const Hoge: NextPage = () => {
  const init = async () => {
    // const provider = new Provider('https://zksync2-testnet.zksync.dev');
    const provider = new Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const contract = new Contract(
        '0xC1e6762c747043d145755a83C7FeDAD666D86B7F',
        ABI.abi,
        provider.getSigner()
    );
    const tweets = await contract.getTimeline(0, 10);
    console.log(`tweets: ${tweets}`);
    console.log(await contract.getUserIcon('0xfB9AaE55f46F03a2FF53882b432Fbf52Fc6B668F'))
  }

  const tweet = async () => {
    const provider = (new Web3Provider(window.ethereum));
    await provider.send("eth_requestAccounts", []);
    const contract = new Contract(
        '0xC1e6762c747043d145755a83C7FeDAD666D86B7F',
        ABI.abi,
        provider.getSigner()
    );
    const txHandle = await contract.setTweet('tweet to zksync!', '', {
      customData: {
        // DAI
        feeToken: "0x5C221E77624690fff6dd741493D735a17716c26B",
      },
    })
    await txHandle.wait();
    console.log('tweeted!');
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <>
      <Head>
        <title>Twitter ETH</title>
      </Head>
      <div>
        Hello
        <Button onClick={() => tweet()}>Tweet</Button>
      </div>
    </>
  );
};

export default Hoge;