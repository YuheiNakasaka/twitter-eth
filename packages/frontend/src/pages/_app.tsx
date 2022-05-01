import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import nprogress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import * as gtag from "utils/gtag";
import Layout from "layouts/Layout";
import { ChainId, DAppProvider, Config, useEthers } from "@usedapp/core";

const zkSyncChainId = 280
const config: Config = {
  multicallAddresses: {
    [ChainId.Hardhat]: "0x7223fF34EED050aeb29432521b084Efb8d296914",
  },
  supportedChains: [ChainId.Hardhat, ChainId.Mainnet, ChainId.Ropsten, ChainId.Goerli, zkSyncChainId],
};

nprogress.configure({ showSpinner: false, speed: 400, minimum: 0.25 });

function AppInit() {
  const { account } = useEthers();
  const router = useRouter();
  useEffect(() => {
    if (!account) {
      if (router.pathname !== "/") {
        router.push("/");
      }
    }
  }, [account]);
  return null;
}

function MyApp({ Component, pageProps }: AppProps) {
  if (process.browser) {
    nprogress.start();
  }

  const router = useRouter();
  useEffect(() => {
    router.events.on("routeChangeComplete", (url) => {
      console.log(url);
      nprogress.done();
      gtag.pageView(url);
    });
    nprogress.done();
    return () => {
      router.events.off("routeChangeComplete", (url) => {
        gtag.pageView(url);
      });
    };
  }, [router.events]);

  return (
    <DAppProvider config={config}>
      <ChakraProvider>
        <Layout>
          <Component {...pageProps} />
          <AppInit />
        </Layout>
      </ChakraProvider>
    </DAppProvider>
  );
}

export default MyApp;
