import { ReactNode } from "react";
import Head from "next/head";

type LayoutProps = {
  title?: string;
  children: ReactNode;
};

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "Twitter ETH"}</title>
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@razokulover" />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}`}
        />
        <meta property="og:title" content="Twitter ETH" />
        <meta property="og:image" content={`/razokulover-icon.png`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <style>
          {`
                body {
                  font-family: -apple-system,"BlinkMacSystemFont","Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif,"Segoe UI Emoji";
                  font-size: 1.05em;
                }
                ul {
                  margin: 0 !important;
                  padding: 0;
                  list-style-type: none !important;
                }
          `}
        </style>
      </Head>

      {children}
    </>
  );
};

export default Layout;
