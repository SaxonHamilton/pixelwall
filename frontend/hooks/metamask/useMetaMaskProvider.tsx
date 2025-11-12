import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Eip1193Provider } from "ethers";
import { useEip6963 } from "./useEip6963";

export function useMetaMaskProvider() {
  const providers = useEip6963();
  const [selectedProvider, setSelectedProvider] = useState<Eip1193Provider | undefined>(
    undefined
  );

  useEffect(() => {
    if (providers.length === 0) return;
    const injected = providers.find((p) => p.info.rdns?.includes("metamask"));
    if (injected) {
      setSelectedProvider(injected.provider);
    } else {
      setSelectedProvider(providers[0]?.provider);
    }
  }, [providers]);

  const browserProvider = useMemo(() => {
    if (!selectedProvider) return undefined;
    return new BrowserProvider(selectedProvider);
  }, [selectedProvider]);

  return { provider: selectedProvider, browserProvider };
}

