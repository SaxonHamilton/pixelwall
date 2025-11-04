import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const autoMine = ["hardhat", "localhost"].includes(network.name);

  await deploy("PixelWall", {
    from: deployer,
    args: [],
    log: true,
    autoMine,
  });
};

export default func;
func.tags = ["PixelWall"];

