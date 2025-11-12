import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserProvider, JsonRpcSigner, Network } from "ethers";
import { useMetaMaskProvider } from "./useMetaMaskProvider";

export function useMetaMaskEthersSigner() {
  const { provider: eip1193Provider, browserProvider } = useMetaMaskProvider();
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [accounts, setAccounts] = useState<string[] | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [ethersSigner, setEthersSigner] = useState<JsonRpcSigner | undefined>(undefined);
  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<BrowserProvider | undefined>(
    undefined
  );

  const sameChain = useRef<(candidate: number | undefined) => boolean>(() => false);
  const sameSigner = useRef<(candidate: JsonRpcSigner | undefined) => boolean>(() => false);

  useEffect(() => {
    if (!browserProvider) {
      setChainId(undefined);
      setAccounts(undefined);
      setIsConnected(false);
      setEthersSigner(undefined);
      setEthersReadonlyProvider(undefined);
      return;
    }
    setEthersReadonlyProvider(browserProvider);

    let stale = false;

    const updateChainAndAccounts = async () => {
      try {
        const network: Network = await browserProvider.getNetwork();
        const accountsList = await browserProvider.listAccounts();

        if (stale) return;

        setChainId(Number(network.chainId));
        setAccounts(accountsList.map((a) => a.address));
        setIsConnected(accountsList.length > 0);
        setEthersSigner(accountsList[0]);
      } catch (error) {
        console.error("[useMetaMaskEthersSigner] update error", error);
      }
    };

    updateChainAndAccounts();

    const handleChainChanged = (hexChainId: string) => {
      const parsed = Number.parseInt(hexChainId, 16);
      setChainId(parsed);
    };

    const handleAccountsChanged = (accs: string[]) => {
      setAccounts(accs);
      setIsConnected(accs.length > 0);
    };

    (eip1193Provider as any)?.on?.("chainChanged", handleChainChanged);
    (eip1193Provider as any)?.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      stale = true;
      (eip1193Provider as any)?.removeListener?.("chainChanged", handleChainChanged);
      (eip1193Provider as any)?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [browserProvider, eip1193Provider]);

  const connect = useCallback(async () => {
    if (!browserProvider) {
      throw new Error("MetaMask provider not detected");
    }
    const requested = await browserProvider.send("eth_requestAccounts", []);
    setAccounts(requested);
    setIsConnected(requested.length > 0);
    const signer = await browserProvider.getSigner();
    setEthersSigner(signer);
    return requested;
  }, [browserProvider]);

  sameChain.current = (candidate: number | undefined) => {
    if (candidate === undefined || chainId === undefined) return false;
    return candidate === chainId;
  };

  sameSigner.current = (candidate: JsonRpcSigner | undefined) => {
    if (!candidate || !ethersSigner) return false;
    return candidate.address === ethersSigner.address;
  };

  const initialMockChains = useMemo(() => ({ 31337: "http://localhost:8545" }), []);

  return {
    provider: eip1193Provider,
    browserProvider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  };
}

