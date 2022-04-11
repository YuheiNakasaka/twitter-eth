const { Wallet, Provider } = require("zksync-web3");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const functionName = "TwitterV1";

module.exports = async function (hre) {
  console.log("Start deploy!");
  const provider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new Wallet(process.env.PRIVATE_KEY).connect(provider);
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact(functionName);
  const deployed = await deployer.deploy(
    artifact,
    [],
    "0x5C221E77624690fff6dd741493D735a17716c26B"
  );
  const contractAddress = deployed.address;
  console.log(`${functionName} deployed to:`, contractAddress);

  // Copying ABIs to frontend.
  const fs = require("fs");
  const contractDir = __dirname + "/../../frontend/src/resources";
  const compiledArtifact = artifacts.readArtifactSync(functionName);
  fs.writeFileSync(
    contractDir + "/contract-abi.json",
    JSON.stringify(compiledArtifact, null, 2)
  );
};
