const { ethers, upgrades } = require("hardhat");
const functionName = "TwitterV1";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Start deploy!: ", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Contract = await ethers.getContractFactory("TwitterV1");
  console.log("Create ContractFactory!");
  const deployed = await upgrades.deployProxy(Contract, [], {
    initializer: "initialize",
  });

  // It may take much time(about 3 hours...) to finish deployment in testnet.
  console.log("Deploying...: ", deployed.address);

  await deployed.deployed();

  console.log(`${functionName} deployed to:`, deployed.address);

  // Copying ABIs to frontend.
  const fs = require("fs");
  const contractDir = __dirname + "/../../frontend/src/resources";

  const artifact = artifacts.readArtifactSync(functionName);
  fs.writeFileSync(
    contractDir + "/contract-abi.json",
    JSON.stringify(artifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
