export type Eip6963ProviderDetail = {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns?: string;
  };
  provider: import("ethers").Eip1193Provider;
};

