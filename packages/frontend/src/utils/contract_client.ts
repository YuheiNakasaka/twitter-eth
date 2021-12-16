import { utils, Contract, ethers } from "ethers";

import ABI from "resources/contract-abi.json";

export const contractClient = (library: any) => {
  const inteface = new utils.Interface(ABI.abi);
  return new Contract(
    `${process.env.NEXT_PUBLIC_TWITTER_ETH_CONTRACT_ID}`,
    inteface,
    library?.getSigner()
  );
};

export const contractProvider = (library: any) => {
  return new ethers.providers.Web3Provider(library.provider);
};
