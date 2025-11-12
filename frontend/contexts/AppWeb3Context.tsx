"use client";

import { ReactNode, createContext, useContext, useMemo } from "react";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm, FhevmGoState } from "@/fhevm/useFhevm";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";

type AppWeb3ContextValue = ReturnType<typeof useMetaMaskEthersSigner> & {
  fhevmInstance: FhevmInstance | undefined;
  fhevmStatus: FhevmGoState;
  fhevmError: Error | undefined;
  refreshFhevm: () => void;
};

const AppWeb3Context = createContext<AppWeb3ContextValue | null>(null);

export function AppWeb3Provider({ children }: { children: ReactNode }) {
  const metaMask = useMetaMaskEthersSigner();

  const fhevmState = useFhevm({
    provider: metaMask.provider ?? undefined,
    chainId: metaMask.chainId,
    initialMockChains: metaMask.initialMockChains,
    enabled: Boolean(metaMask.provider && metaMask.chainId),
  });

  const value = useMemo<AppWeb3ContextValue>(() => {
    return {
      ...metaMask,
      fhevmInstance: fhevmState.instance,
      fhevmStatus: fhevmState.status,
      fhevmError: fhevmState.error,
      refreshFhevm: fhevmState.refresh,
    };
  }, [metaMask, fhevmState.instance, fhevmState.status, fhevmState.error, fhevmState.refresh]);

  return <AppWeb3Context.Provider value={value}>{children}</AppWeb3Context.Provider>;
}

export function useAppWeb3() {
  const ctx = useContext(AppWeb3Context);
  if (!ctx) {
    throw new Error("useAppWeb3 must be used within an AppWeb3Provider");
  }
  return ctx;
}

