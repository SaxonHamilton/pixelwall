# PixelWall Contracts

PixelWall 智能合约基于 Hardhat 与 Zama FHEVM 插件构建，既可在本地 Hardhat FHEVM Mock 环境运行，也能部署到 Sepolia 测试网并通过 Relayer SDK 与前端交互。

## 安装依赖

```bash
cd action/contracts
npm install
```

## 本地开发（Mock FHEVM）

1. 启动 Hardhat FHEVM 节点：

   ```bash
   npx hardhat node --hostname 0.0.0.0
   ```

2. 在新的终端部署合约：

   ```bash
   npx hardhat deploy --network localhost
   ```

3. 运行测试（仅在本地 mock 环境有效）：

   ```bash
   npx hardhat test
   ```

## 部署到 Sepolia

1. 在 `.env` 或 shell 中配置以下变量：

   ```bash
   export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/<API_KEY>"
   export SEPOLIA_PRIVATE_KEY="0x<YOUR_PRIVATE_KEY>"
   ```

2. 部署：

   ```bash
   npx hardhat deploy --network sepolia
   ```

部署完成后会在 `deployments/<network>/PixelWall.json` 中生成地址与 ABI，前端可通过 `npm run generate:abi` 自动同步。

## 常用任务

- 解密指定像素：

  ```bash
  npx hardhat pixelwall:decrypt-pixel --canvas 1 --x 10 --y 20 --network localhost
  ```

- 解密画布总笔画数：

  ```bash
  npx hardhat pixelwall:decrypt-strokes --canvas 1 --network localhost
  ```

