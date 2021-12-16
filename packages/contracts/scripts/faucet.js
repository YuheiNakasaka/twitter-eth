const ethers = require("ethers");

async function sendETH() {
  const wallet = new ethers.Wallet(
    // Test account's fixed private key in hardhat local node
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    ethers.getDefaultProvider("http://127.0.0.1:8545/")
  );
  const tx = await wallet.sendTransaction({
    to: "0xfB9AaE55f46F03a2FF53882b432Fbf52Fc6B668F",
    value: ethers.constants.WeiPerEther.mul(10),
  });
  await tx.wait();
  console.log(
    `Transferred 10 ETH to 0xfB9AaE55f46F03a2FF53882b432Fbf52Fc6B668F`
  );
}

sendETH();
