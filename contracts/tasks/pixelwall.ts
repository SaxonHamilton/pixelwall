import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("pixelwall:decrypt-pixel", "Decrypt a pixel handle from a deployed PixelWall canvas")
  .addParam("canvas", "Canvas identifier")
  .addParam("x", "Pixel X coordinate")
  .addParam("y", "Pixel Y coordinate")
  .addOptionalParam("address", "PixelWall contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const canvasId = Number(taskArguments.canvas);
    const x = Number(taskArguments.x);
    const y = Number(taskArguments.y);

    const deployment =
      taskArguments.address !== undefined
        ? { address: taskArguments.address as string }
        : await deployments.get("PixelWall");

    const pixelWall = await ethers.getContractAt("PixelWall", deployment.address);

    const pixelView = await pixelWall.getPixelView(canvasId, x, y);
    if (pixelView.encryptedColor === ethers.ZeroHash) {
      console.log("Pixel is empty (handle == 0)");
      return;
    }

    const [signer] = await ethers.getSigners();

    const clearColor = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      pixelView.encryptedColor,
      deployment.address,
      signer
    );

    console.log(`Pixel (${canvasId}, ${x}, ${y}) by ${pixelView.painter} at ${pixelView.updatedAt}`);
    console.log(`Encrypted handle: ${pixelView.encryptedColor}`);
    console.log(`Clear color (uint32): ${clearColor}`);
  });

task("pixelwall:decrypt-strokes", "Decrypt the encrypted stroke count of a canvas")
  .addParam("canvas", "Canvas identifier")
  .addOptionalParam("address", "PixelWall contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const canvasId = Number(taskArguments.canvas);

    const deployment =
      taskArguments.address !== undefined
        ? { address: taskArguments.address as string }
        : await deployments.get("PixelWall");

    const pixelWall = await ethers.getContractAt("PixelWall", deployment.address);
    const encryptedCount = await pixelWall.getCanvasStrokeCount(canvasId);

    if (encryptedCount === ethers.ZeroHash) {
      console.log(`Canvas ${canvasId} has zero strokes`);
      return;
    }

    const [signer] = await ethers.getSigners();

    const clearCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCount,
      deployment.address,
      signer
    );

    console.log(`Canvas ${canvasId} has ${clearCount} strokes (decrypted)`);
  });

