const dotenv = require("dotenv");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-contract-sizer");
require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const zkSyncDeploy =
  process.env.NODE_ENV == "test"
    ? {
        zkSyncNetwork: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
      }
    : {
        zkSyncNetwork: "https://zksync2-testnet.zksync.dev",
        ethNetwork: "goerli",
      };

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  zksolc: {
    version: "0.1.0",
    compilerSource: "docker",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      experimental: {
        dockerImage: "matterlabs/zksolc",
      },
    },
  },
  zkSyncDeploy,
  solidity: {
    version: "0.8.10",
  },
  networks: {
    hardhat: {
      zksync: true,
    },
  },
};
