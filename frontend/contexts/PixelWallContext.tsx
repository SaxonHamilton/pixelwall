"use client";

import { ReactNode, createContext, useContext } from "react";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { usePixelWall } from "@/hooks/usePixelWall";

type PixelWallContextValue = ReturnType<typeof usePixelWall>;

const PixelWallContext = createContext<PixelWallContextValue | null>(null);

export function PixelWallProvider({
  children,
  canvasId = 1,
  autoDecrypt,
}: {
  children: ReactNode;
  canvasId?: number;
  autoDecrypt?: boolean;
}) {
  const { storage } = useInMemoryStorage();
  const pixelWall = usePixelWall({
    fhevmDecryptionSignatureStorage: storage,
    canvasId,
    autoDecrypt,
  });

  return <PixelWallContext.Provider value={pixelWall}>{children}</PixelWallContext.Provider>;
}

export function usePixelWallContext() {
  const ctx = useContext(PixelWallContext);
  if (!ctx) {
    throw new Error("usePixelWallContext must be used within a PixelWallProvider");
  }
  return ctx;
}

