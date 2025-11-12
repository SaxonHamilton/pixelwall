import { useEffect, useState } from "react";
import type { Eip6963ProviderDetail } from "./Eip6963Types";

export function useEip6963() {
  const [providers, setProviders] = useState<Eip6963ProviderDetail[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlers = new Set<(event: CustomEvent<Eip6963ProviderDetail>) => void>();

    function handler(event: Event) {
      const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
      setProviders((prev) => {
        if (prev.find((p) => p.info.uuid === detail.info.uuid)) {
          return prev;
        }
        return [...prev, detail];
      });
    }

    handlers.add(handler);
    window.addEventListener("eip6963:announceProvider", handler as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handler as EventListener);
      handlers.delete(handler);
    };
  }, []);

  return providers;
}

