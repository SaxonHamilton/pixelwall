import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const contractsDeploymentsRoot =
  process.env.CONTRACTS_DEPLOYMENTS_ROOT ||
  path.resolve(__dirname, "../../contracts/deployments");

async function main() {
  const abiDir = path.resolve(__dirname, "../abi");
  await mkdir(abiDir, { recursive: true });

  const networks = await safeReadDir(contractsDeploymentsRoot);
  const addressBook = {};

  let abi = null;

  for (const network of networks) {
    const networkDir = path.join(contractsDeploymentsRoot, network);
    const deploymentFile = path.join(networkDir, "PixelWall.json");
    const data = await safeReadJSON(deploymentFile);
    if (!data) continue;

    if (!abi && data.abi) {
      abi = data.abi;
    }

    if (data.address) {
      addressBook[data.chainId?.toString() ?? network] = {
        address: data.address,
        chainName: data.metadata?.name ?? network,
        chainId: data.chainId,
      };
    }
  }

  if (!abi) {
    throw new Error(
      `未找到 PixelWall ABI。请先在 ${contractsDeploymentsRoot} 下部署生成 PixelWall.json`
    );
  }

  await writeFile(
    path.join(abiDir, "PixelWallABI.ts"),
    `export const PixelWallABI = ${JSON.stringify({ abi }, null, 2)} as const;\n`
  );

  await writeFile(
    path.join(abiDir, "PixelWallAddresses.ts"),
    `export const PixelWallAddresses = ${JSON.stringify(addressBook, null, 2)} as const;\n`
  );

  console.log("✅ 生成 PixelWall ABI 与地址完成");
}

async function safeReadDir(dir) {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

async function safeReadJSON(file) {
  try {
    const content = await readFile(file, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

main().catch((error) => {
  console.error("genabi.mjs 运行失败:", error);
  process.exitCode = 1;
});

