import { expect } from "chai";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { PixelWall } from "../types";
import hre, { ethers, deployments, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("PixelWall (local mock)", function () {
  let deployer: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let pixelWall: PixelWall;

  before(async function () {
    const signers = await ethers.getSigners();
    [deployer, alice] = signers;
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("PixelWall local tests require the FHEVM mock environment");
      this.skip();
    }

    await deployments.fixture(["PixelWall"]);

    const deployment = await deployments.get("PixelWall");
    pixelWall = await ethers.getContractAt("PixelWall", deployment.address);
  });

  it("creates a canvas and paints an encrypted pixel", async function () {
    const tx = await pixelWall.connect(alice).createCanvas(128, 128);
    const receipt = await tx.wait();
    const canvasId = receipt?.logs[0]?.args?.canvasId ?? 1n;

    const input = await fhevm
      .createEncryptedInput(pixelWall.target as string, alice.address)
      .add32(0xff3366);
    const encryptedColor = await input.encrypt();

    await expect(
      pixelWall
        .connect(alice)
        .setPixel(
          Number(canvasId),
          10,
          20,
          encryptedColor.handles[0],
          encryptedColor.inputProof
        )
    ).to.emit(pixelWall, "PixelUpdated");

    const pixelView = await pixelWall.getPixelView(Number(canvasId), 10, 20);
    expect(pixelView.painter).to.equal(alice.address);
    expect(pixelView.encryptedColor).to.not.equal(ethers.ZeroHash);

    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      pixelView.encryptedColor,
      pixelWall.target as string,
      alice
    );
    expect(Number(decrypted)).to.equal(0xff3366);
  });

  it("increments encrypted stroke counters", async function () {
    const tx = await pixelWall.connect(deployer).createCanvas(32, 32);
    const receipt = await tx.wait();
    const canvasId = Number(receipt?.logs[0]?.args?.canvasId ?? 1n);

    const firstPixelInput = await fhevm
      .createEncryptedInput(pixelWall.target as string, deployer.address)
      .add32(0x123456);
    const firstEncrypted = await firstPixelInput.encrypt();

    await pixelWall
      .connect(deployer)
      .setPixel(canvasId, 0, 0, firstEncrypted.handles[0], firstEncrypted.inputProof);

    const strokeCountEncrypted = await pixelWall.getCanvasStrokeCount(canvasId);
    const decryptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      strokeCountEncrypted,
      pixelWall.target as string,
      deployer
    );
    expect(Number(decryptedCount)).to.equal(1);
  });
});

