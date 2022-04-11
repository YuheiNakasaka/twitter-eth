import { utils } from "ethers";
import { Contract, Web3Provider, Provider, Wallet } from "zksync-web3";
import ABI from "resources/contract-abi.json";

export const contractClient = async (library: any, isSigner: boolean) => {
  const inteface = new utils.Interface(ABI.abi);
  const signer = new Web3Provider(library.provider).getSigner();
  return new Contract(
    `${process.env.NEXT_PUBLIC_TWITTER_ETH_CONTRACT_ID}`,
    inteface,
    signer
  );
};

export const contractProvider = (library: any) => {
  return new Provider("https://zksync2-testnet.zksync.dev");
};
