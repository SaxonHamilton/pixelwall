//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAYS DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider, Contract } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import type { FhevmInstance } from "../../fhevmTypes";

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  const provider = new JsonRpcProvider(parameters.rpcUrl);
  // 动态查询 InputVerifier 的 EIP712 domain，获取实际 verifyingContract 地址
  const inputVerifierContract = new Contract(
    parameters.metadata.InputVerifierAddress,
    [
      "function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])",
    ],
    provider
  );
  const domain = await inputVerifierContract.eip712Domain();
  const verifyingContractAddressInputVerification = domain[4] as `0x${string}`;

  const instance = await MockFhevmInstance.create(
    provider,
    provider,
    {
      aclContractAddress: parameters.metadata.ACLAddress,
      chainId: parameters.chainId,
      // 使用真实链 ID（mock 场景由 hardhat node 决定）
      gatewayChainId: parameters.chainId,
      inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
      kmsContractAddress: parameters.metadata.KMSVerifierAddress,
      verifyingContractAddressDecryption:
        "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
      verifyingContractAddressInputVerification,
    },
    {
      // v0.3.0 新增第 4 个参数：properties（必填）
      inputVerifierProperties: {},
      kmsVerifierProperties: {},
    }
  );
  return instance as unknown as FhevmInstance;
};

