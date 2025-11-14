export type FhevmInstance = {
  createEncryptedInput: (contractAddress: `0x${string}`, userAddress: `0x${string}`) => {
    add32: (value: number) => ReturnType<FhevmInstance["createEncryptedInput"]>;
    encrypt: () => Promise<{ handles: [`0x${string}`]; inputProof: `0x${string}` }>;
  };
  userDecrypt: (
    handles: { handle: `0x${string}`; contractAddress: `0x${string}` }[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: `0x${string}`[],
    userAddress: `0x${string}`,
    startTimestamp: number,
    durationDays: number
  ) => Promise<Record<string, string | number | bigint>>;
  generateKeypair: () => { publicKey: string; privateKey: string };
  createEIP712: (
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: number,
    durationDays: number
  ) => EIP712Type;
  getPublicKey: () => string;
  getPublicParams: (bits: number) => Uint8Array;
};

export type EIP712Type = {
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  message: Record<string, string | number | bigint | string[]>;
};

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

