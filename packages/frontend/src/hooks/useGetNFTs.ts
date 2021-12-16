import { GetNFTResponse } from "models/nft";

export const useGetNFTs = () => {
  return async (address: string, chain: string): Promise<GetNFTResponse> => {
    if (address && address !== "") {
      console.log("=== Requesting: useGetNFTs ===");
      const response = await fetch(
        `/api/get_nfts?address=${address}&chain=${chain}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((res) => res.json())
        .catch((err) => console.log(err));
      return response as GetNFTResponse;
    } else {
      return {
        total: 0,
        page: 0,
        page_size: 500,
        result: [],
        status: "",
      };
    }
  };
};
