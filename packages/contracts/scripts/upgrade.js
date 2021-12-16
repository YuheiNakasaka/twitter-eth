const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Start upgrade!: ", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const Twitter = await ethers.getContractFactory("TwitterV2");
  console.log("Create ContractFactory!");
  const twitter = await upgrades.upgradeProxy(
    process.env.PROXY_CONTRACT_ADDRESS,
    Twitter
  );

  // It may take much time(about 3 hours...) to finish deployment in testnet.
  console.log("Deploying...: ", twitter.address);

  await twitter.deployed();

  console.log("Twitter upgraded to:", twitter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
