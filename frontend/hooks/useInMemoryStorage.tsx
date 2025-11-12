import { useMemo } from "react";
import { createPersistentStorage, GenericStringStorage } from "@/fhevm/GenericStringStorage";

export function useInMemoryStorage(): { storage: GenericStringStorage } {
  const storage = useMemo(() => createPersistentStorage(), []);
  return { storage };
}

