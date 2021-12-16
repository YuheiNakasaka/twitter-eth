import type { NextApiRequest, NextApiResponse } from "next";
import { NFTMetaData, GetNFTResponse } from "models/nft";

const mockObject: GetNFTResponse = {
  total: 1,
  page: 0,
  page_size: 500,
  result: [
    {
      token_address: "0x495f947276749ce646f68ac8c248420045cb7b5e",
      token_id:
        "78505287876114873744754849542832275063014098647883046073289702868033529184266",
      amount: "1",
      owner_of: "0x1faf5c84934fadaaa23eb7e6c7b284e98d63d75b",
      block_number: "13325392",
      block_number_minted: "13306571",
      contract_type: "ERC1155",
      token_uri:
        "https://api.opensea.io/api/v1/metadata/0x495f947276749Ce646f68AC8c248420045cb7b5e/0xad906b1684063008c16488067e7545148b0bf2b800000000000017000000000a",
      metadata:
        '{"name":"First supporter\'s card","description":null,"external_link":null,"image":"https://lh3.googleusercontent.com/MRBCZ-DoHquAH2XhoZhjr82S63RYixLSIu1ZVRXrbk6jkBYPMa7fEmgGQiIPKmVFS6xJ5rFlU5pVS9KpSteXybipo8TcZRHuR0xQVtM","animation_url":"https://storage.opensea.io/files/b887252e081e1c8536ad4eb1179f8513.mp4"}',
      synced_at: "2021-11-16T05:59:39.959Z",
      name: "OpenSea Shared Storefront",
      symbol: "OPENSTORE",
    },
    {
      token_address: "0x495f947276749ce646f68ac8c248420045cb7b5e",
      token_id:
        "78505287876114873744754849542832275063014098647883046073289702868033529184266",
      amount: "1",
      owner_of: "0x1faf5c84934fadaaa23eb7e6c7b284e98d63d75b",
      block_number: "13325392",
      block_number_minted: "13306571",
      contract_type: "ERC1155",
      token_uri:
        "https://api.opensea.io/api/v1/metadata/0x495f947276749Ce646f68AC8c248420045cb7b5e/0xad906b1684063008c16488067e7545148b0bf2b800000000000017000000000a",
      metadata:
        '{"name":"First supporter\'s card","description":null,"external_link":null,"image":"https://ipfs.io/ipfs/QmWvWbzUWgefwdVzaaDSGZa6qAuKuWQAzS9pReSJg26hsp","animation_url":"https://storage.opensea.io/files/b887252e081e1c8536ad4eb1179f8513.mp4"}',
      synced_at: "2021-11-16T05:59:39.959Z",
      name: "OpenSea Shared Storefront",
      symbol: "OPENSTORE",
    },
    {
      token_address: "0x495f947276749ce646f68ac8c248420045cb7b5e",
      token_id:
        "78505287876114873744754849542832275063014098647883046073289702868033529184266",
      amount: "1",
      owner_of: "0x1faf5c84934fadaaa23eb7e6c7b284e98d63d75b",
      block_number: "13325392",
      block_number_minted: "13306571",
      contract_type: "ERC1155",
      token_uri:
        "https://api.opensea.io/api/v1/metadata/0x495f947276749Ce646f68AC8c248420045cb7b5e/0xad906b1684063008c16488067e7545148b0bf2b800000000000017000000000a",
      metadata:
        '{"name":"First supporter\'s card","description":null,"external_link":null,"image":"https://storage.googleapis.com/anifty-media/creation/0xa84a0c9ddcd43df115178a3e216f31e53c33e976/d6fd355806054a1caf1de7bd8edcf78e.jpg","animation_url":"https://storage.opensea.io/files/b887252e081e1c8536ad4eb1179f8513.mp4"}',
      synced_at: "2021-11-16T05:59:39.959Z",
      name: "OpenSea Shared Storefront",
      symbol: "OPENSTORE",
    },
  ],
  status: "SYNCING",
};

const iPFSToHTTP = (url: string) => {
  if (url.indexOf("ipfs://ipfs/") !== -1) {
    return `https://ipfs.io/ipfs/${url.split("ipfs://ipfs/")[1]}`;
  } else if (url.indexOf("ipfs://") !== -1) {
    return `https://ipfs.io/ipfs/${url.split("ipfs://")[1]}`;
  }
  return url;
};

const validImageUrl = (metadata: NFTMetaData) => {
  if (metadata.image && metadata.image !== null && metadata.image !== "") {
    metadata.image = iPFSToHTTP(metadata.image);
  } else if (
    metadata.image_url &&
    metadata.image_url !== null &&
    metadata.image_url !== ""
  ) {
    metadata.image = iPFSToHTTP(metadata.image_url);
  } else {
    metadata.image = "https://via.placeholder.com/150";
  }
  return metadata;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetNFTResponse>
) {
  if (req.method === "GET") {
    try {
      const endResp = {
        total: 0,
        page: 0,
        page_size: 500,
        result: [],
        status: "",
      };
      const { address, chain } = req.query;
      if (address && address !== "" && chain && chain !== "") {
        const input = address.toString();
        const parsedInput = input.trim().toLocaleLowerCase();
        console.log(
          `https://deep-index.moralis.io/api/v2/${parsedInput}/nft?chain=${chain}&format=decimal`
        );
        const response: GetNFTResponse = await fetch(
          `https://deep-index.moralis.io/api/v2/${parsedInput}/nft?chain=${chain}&format=decimal`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "X-API-Key": `${process.env.MOLARIS_REST_API_KEY}`,
            },
          }
        ).then((res) => res.json());
        // const response = mockObject;
        const result = response.result
          .filter((item) => item.metadata != null)
          .map((item) => {
            let metadata: NFTMetaData = JSON.parse(item.metadata.toString());
            item.metadata = validImageUrl(metadata);
            return item;
          });
        response.result = result;
        return res.status(200).json(response);
      } else {
        endResp.status = "Invalid request";
        return res.status(400).json(endResp);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).end();
    }
  } else {
    res.status(404).end();
  }
}
