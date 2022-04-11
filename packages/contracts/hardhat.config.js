const dotenv = require("dotenv");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-contract-sizer");
require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

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
  zkSyncDeploy: {
    zkSyncNetwork: "https://zksync2-testnet.zksync.dev",
    ethNetwork: "goerli",
  },
  solidity: {
    version: "0.8.12",
  },
  networks: {
    hardhat: {
      zksync: true,
    },
  },
};
