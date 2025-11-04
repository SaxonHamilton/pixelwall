import { promises as fs } from "fs";
import path from "path";
import { artifacts, ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const factory = await ethers.getContractFactory("PixelWall");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const txHash = contract.deploymentTransaction()?.hash;
  console.log(`PixelWall deployed at ${address}`);
  if (txHash) {
    console.log(`Tx hash: ${txHash}`);
  }

  const artifact = await artifacts.readArtifact("PixelWall");

  const deploymentsDir = path.join(
    __dirname,
    "..",
    "deployments",
    network.name
  );
  await fs.mkdir(deploymentsDir, { recursive: true });

  const output = {
    address,
    abi: artifact.abi,
    transactionHash: txHash,
    chainId: network.config.chainId,
    blockNumber: await ethers.provider.getBlockNumber(),
    deployedAt: Date.now(),
    metadata: {
      name: network.name,
    },
  };

  await fs.writeFile(
    path.join(deploymentsDir, "PixelWall.json"),
    JSON.stringify(output, null, 2),
    "utf8"
  );

  console.log(`Deployment artifact saved to ${deploymentsDir}/PixelWall.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

