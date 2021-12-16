import NextDocument, { Html, Head, Main, NextScript } from "next/document";
import * as gtag from "utils/gtag";

type Props = {};

class Document extends NextDocument<Props> {
  render() {
    return (
      <Html lang="en">
        <Head />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gtag.GA_TRACKING_ID}', {
      page_path: window.location.pathname,
    });
  `,
          }}
        />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
