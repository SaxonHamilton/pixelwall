import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Contract, JsonRpcSigner, Provider, ZeroHash } from "ethers";
import { PixelWallABI } from "@/abi/PixelWallABI";
import { PixelWallAddresses } from "@/abi/PixelWallAddresses";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import type { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { useAppWeb3 } from "@/contexts/AppWeb3Context";

export type PixelCell = {
  x: number;
  y: number;
  handle: `0x${string}`;
  painter: string;
  updatedAt: number;
  color?: string;
};

export type CanvasStats = {
  totalStrokes?: number;
  userStrokes?: number;
};

type DecodeOptions = {
  forceDecrypt?: boolean;
  forceNewSignature?: boolean;
};

export function usePixelWall(parameters: {
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  canvasId?: number;
  instance?: FhevmInstance | undefined;
  ethersSigner?: JsonRpcSigner | undefined;
  ethersReadonlyProvider?: Provider | undefined;
  chainId?: number | undefined;
  sameSigner?: RefObject<(candidate: JsonRpcSigner | undefined) => boolean>;
  autoDecrypt?: boolean;
}) {
  const appWeb3 = useAppWeb3();
  const {
    instance = appWeb3.fhevmInstance,
    ethersSigner = appWeb3.ethersSigner ?? undefined,
    ethersReadonlyProvider = appWeb3.ethersReadonlyProvider ?? undefined,
    chainId = appWeb3.chainId,
    sameSigner = appWeb3.sameSigner,
    fhevmDecryptionSignatureStorage,
    canvasId = 1,
    autoDecrypt = true,
  } = parameters;

  const [statusMessage, setStatusMessage] = useState<string>("准备就绪");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [board, setBoard] = useState<Map<string, PixelCell>>(new Map());
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: 128,
    height: 128,
  });
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string>("#4CC9F0");
  const [stats, setStats] = useState<CanvasStats>({});
  const [tokenId, setTokenId] = useState<number | undefined>(undefined);
  const [decryptionEnabled, setDecryptionEnabled] = useState<boolean>(autoDecrypt !== false);

  const signatureRef = useRef<FhevmDecryptionSignature | null>(null);
  const signaturePromiseRef = useRef<Promise<FhevmDecryptionSignature | null> | null>(null);
  const contractRef = useRef<Contract | null>(null);
  const listenerRef = useRef<() => void>(() => undefined);

  const fallbackSameSignerRef = useRef<(candidate: JsonRpcSigner | undefined) => boolean>(() => false);
  const resolvedSameSigner = sameSigner ?? fallbackSameSignerRef;

  const contractAddress = useMemo(() => {
    if (!chainId) return undefined;
    const entry =
      PixelWallAddresses[
        chainId.toString() as keyof typeof PixelWallAddresses
      ];
    if (!entry || !("address" in entry)) {
      return undefined;
    }
    return entry.address as `0x${string}`;
  }, [chainId]);

  const canInteract = Boolean(
    contractAddress && instance && ethersSigner && resolvedSameSigner.current?.(ethersSigner)
  );

  const contract = useMemo(() => {
    if (!contractAddress || !ethersReadonlyProvider) return null;
    const base = new Contract(contractAddress, PixelWallABI.abi, ethersReadonlyProvider);
    contractRef.current = base;
    return base;
  }, [contractAddress, ethersReadonlyProvider]);

  const writeContract = useMemo(() => {
    if (!contract || !ethersSigner) return null;
    return contract.connect(ethersSigner);
  }, [contract, ethersSigner]);

  const ensureSignature = useCallback(
    async (options?: { forceNew?: boolean }) => {
      if (!instance || !ethersSigner || !contractAddress) return null;

      const forceNew = options?.forceNew ?? false;
      if (!forceNew && signatureRef.current) {
        return signatureRef.current;
      }

      if (forceNew) {
        signatureRef.current = null;
        signaturePromiseRef.current = null;
      } else if (signaturePromiseRef.current) {
        return signaturePromiseRef.current;
      }

      const promise = (async () => {
        try {
          const signature = await FhevmDecryptionSignature.loadOrSign(
            instance,
            [contractAddress],
            ethersSigner,
            fhevmDecryptionSignatureStorage,
            undefined,
            { forceNew }
          );
          signatureRef.current = signature;
          return signature;
        } finally {
          signaturePromiseRef.current = null;
        }
      })();

      signaturePromiseRef.current = promise;
      return promise;
    },
    [contractAddress, ethersSigner, fhevmDecryptionSignatureStorage, instance]
  );

  const decodeHandleMap = useCallback(
    async (handles: `0x${string}`[], options?: DecodeOptions) => {
      const shouldDecrypt = options?.forceDecrypt ?? decryptionEnabled;
      if (!shouldDecrypt) {
        return {};
      }
      if (!instance || !ethersSigner || !contractAddress) return {};
      const signature = await ensureSignature({ forceNew: options?.forceNewSignature });
      if (!signature) {
        setStatusMessage("无法生成 FHE 解密签名");
        return {};
      }

      const uniqueHandles = Array.from(new Set(handles.filter((h) => h !== ZeroHash)));
      if (uniqueHandles.length === 0) {
        return {};
      }

      const payload = uniqueHandles.map((handle) => ({
        handle,
        contractAddress,
      }));

      setIsDecrypting(true);
      try {
        const result = await instance.userDecrypt(
          payload,
          signature.privateKey,
          signature.publicKey,
          signature.signature,
          signature.contractAddresses,
          signature.userAddress,
          signature.startTimestamp,
          signature.durationDays
        );
        return result;
      } finally {
        setIsDecrypting(false);
      }
    },
    [contractAddress, decryptionEnabled, ensureSignature, ethersSigner, instance]
  );

  const refreshCanvasMeta = useCallback(async () => {
    if (!contract || !contractAddress) return;
    try {
      const [meta, mintedTokenId] = await contract.getCanvasMeta(canvasId);
      setCanvasSize({ width: Number(meta.width), height: Number(meta.height) });
      setIsLocked(meta.isLocked);
      setLastUpdatedAt(meta.lockedAt > 0 ? Number(meta.lockedAt) : Number(meta.createdAt));
      setTokenId(mintedTokenId > 0 ? Number(mintedTokenId) : undefined);
    } catch (error) {
      console.error("[usePixelWall] refreshCanvasMeta", error);
      setStatusMessage("无法加载画布元数据");
    }
  }, [canvasId, contract, contractAddress]);

  const refreshBoardFromEvents = useCallback(
    async (options?: DecodeOptions) => {
      if (!contractAddress || !contract || !instance || !ethersSigner) {
        setStatusMessage("请连接钱包并初始化 FHEVM");
        return;
      }

      setIsSyncing(true);
      try {
        const filter = contract.filters.PixelUpdated(canvasId);
        const events = await contract.queryFilter(filter, 0, "latest");

        if (events.length === 0) {
          setBoard(new Map());
          return;
        }

        const typedEvents = events.filter((e: any) => (e as any).args);
        const handles = typedEvents
          .map((event: any) => event.args?.encryptedColorHandle as `0x${string}`)
          .filter(Boolean);
        const decrypted = await decodeHandleMap(handles, options);

        const nextBoard = new Map<string, PixelCell>();
        for (const event of typedEvents as any[]) {
          const { x, y, painter, encryptedColorHandle } = event.args || {};
          if (x === undefined || y === undefined) continue;
          const key = `${x}:${y}`;
          const handle = encryptedColorHandle as `0x${string}`;
          const clearValue = decrypted?.[handle];
          const colorHex =
            clearValue === undefined
              ? undefined
              : normalizeColor(clearValue as string | number | bigint);
          nextBoard.set(key, {
            x: Number(x),
            y: Number(y),
            handle,
            painter,
            updatedAt: Math.floor(Date.now() / 1000),
            color: colorHex,
          });
        }
        setBoard(nextBoard);
        setStatusMessage(
          (options?.forceDecrypt ?? decryptionEnabled)
            ? "画布数据已同步"
            : "画布数据已同步（待解密）"
        );
      } catch (error) {
        console.error("[usePixelWall] refreshBoardFromEvents", error);
        setStatusMessage("同步画布失败，请稍后重试");
      } finally {
        setIsSyncing(false);
      }
    },
    [canvasId, contract, contractAddress, decodeHandleMap, decryptionEnabled, ethersSigner, instance]
  );

  const refreshStrokeStats = useCallback(
    async (options?: DecodeOptions) => {
      if (!contractAddress || !contract || !instance || !ethersSigner) return;
      try {
        const encryptedCount = await contract.getCanvasStrokeCount(canvasId);
        const contribution = await contract.getPainterContribution(ethersSigner.address);
        const decrypted = await decodeHandleMap(
          [encryptedCount as `0x${string}`, contribution as `0x${string}`],
          options
        );
        const totalStrokes = parseDecryptedNumber(
          decrypted?.[encryptedCount as `0x${string}`]
        );
        const userStrokes = parseDecryptedNumber(
          decrypted?.[contribution as `0x${string}`]
        );
        setStats({ totalStrokes, userStrokes });
      } catch (error) {
        console.error("[usePixelWall] refreshStrokeStats", error);
      }
    },
    [canvasId, contract, contractAddress, decodeHandleMap, ethersSigner, instance]
  );

  useEffect(() => {
    signatureRef.current = null;
    signaturePromiseRef.current = null;
  }, [chainId, contractAddress, ethersSigner]);

  useEffect(() => {
    refreshCanvasMeta();
    const shouldForce = autoDecrypt !== false;
    refreshBoardFromEvents({ forceDecrypt: shouldForce });
    refreshStrokeStats({ forceDecrypt: shouldForce });
  }, [autoDecrypt, refreshBoardFromEvents, refreshCanvasMeta, refreshStrokeStats]);

  useEffect(() => {
    if (!contract || !contractAddress || !instance || !ethersSigner) {
      return;
    }
    const onPixelUpdated = async (
      updatedCanvasId: bigint,
      x: bigint,
      y: bigint,
      painter: string,
      encryptedColorHandle: `0x${string}`
    ) => {
      if (Number(updatedCanvasId) !== canvasId) return;

      const decrypted = await decodeHandleMap([encryptedColorHandle]);
      const colorHex = decrypted
        ? normalizeColor(decrypted[encryptedColorHandle] as string | number | bigint)
        : undefined;

      setBoard((prev) => {
        const next = new Map(prev);
        next.set(`${x}:${y}`, {
          x: Number(x),
          y: Number(y),
          handle: encryptedColorHandle,
          painter,
          updatedAt: Number(Date.now() / 1000),
          color: colorHex,
        });
        return next;
      });

      refreshStrokeStats();
      setStatusMessage("像素已更新并解密");
    };

    contract.on("PixelUpdated", onPixelUpdated);
    listenerRef.current = () => {
      contract.off("PixelUpdated", onPixelUpdated);
    };

    return () => {
      listenerRef.current();
    };
  }, [
    canvasId,
    contract,
    contractAddress,
    decodeHandleMap,
    ethersSigner,
    instance,
    refreshStrokeStats,
  ]);

  const paintPixel = useCallback(
    async (x: number, y: number, colorHex: string) => {
      if (!writeContract || !contractAddress || !instance || !ethersSigner) {
        setStatusMessage("请连接钱包并等待 FHEVM 初始化");
        return;
      }
      if (isLocked) {
        setStatusMessage("画布已锁定，无法继续绘制");
        return;
      }

      const colorValue = parseInt(colorHex.replace("#", ""), 16);
      if (Number.isNaN(colorValue)) {
        setStatusMessage("颜色格式不正确");
        return;
      }

      setIsSubmitting(true);
      setStatusMessage("正在加密像素...");

      try {
        const encryptedInput = await instance
          .createEncryptedInput(contractAddress, ethersSigner.address as `0x${string}`)
          .add32(colorValue)
          .encrypt();

        setStatusMessage("正在提交交易...");
        const tx = await (writeContract as any).setPixel(
          canvasId,
          x,
          y,
          encryptedInput.handles[0],
          encryptedInput.inputProof
        );
        await tx.wait();
        setStatusMessage("像素已提交，等待事件刷新");
      } catch (error) {
        console.error("[usePixelWall] paintPixel error", error);
        setStatusMessage("绘制失败，请重试");
      } finally {
        setIsSubmitting(false);
      }
    },
    [canvasId, contractAddress, ethersSigner, instance, isLocked, writeContract]
  );

  const lockCurrentCanvas = useCallback(async () => {
    if (!writeContract) return;
    try {
      const tx = await (writeContract as any).lockCanvas(canvasId);
      await tx.wait();
      setIsLocked(true);
      setStatusMessage("画布已锁定");
    } catch (error) {
      console.error("[usePixelWall] lockCanvas", error);
      setStatusMessage("锁定失败");
    }
  }, [canvasId, writeContract]);

  const mintCanvasSnapshot = useCallback(
    async (metadataCID: string) => {
      if (!writeContract) return;
      try {
        const tx = await (writeContract as any).mintCanvasNFT(canvasId, metadataCID);
        const receipt = await tx.wait();
        const mintedEvent = receipt?.logs
          ?.map((log: any) => {
            try {
              return contract?.interface.parseLog(log);
            } catch {
              return undefined;
            }
          })
          .find((parsed: any) => parsed && parsed.name === "CanvasMinted");

        const mintedTokenId =
          mintedEvent?.args?.tokenId !== undefined
            ? Number(mintedEvent.args.tokenId)
            : undefined;
        setTokenId(mintedTokenId);
        setStatusMessage("画布已铸造成 NFT");
        return mintedTokenId;
      } catch (error) {
        console.error("[usePixelWall] mintCanvasSnapshot", error);
        setStatusMessage("铸造失败");
        return undefined;
      }
    },
    [canvasId, contract, writeContract]
  );

  const orderedCells = useMemo(() => {
    const cells = Array.from(board.values());
    return cells.sort((a, b) => a.y - b.y || a.x - b.x);
  }, [board]);

  const enableDecryption = useCallback(
    async ({ forceNewSignature = false }: { forceNewSignature?: boolean } = {}) => {
      setDecryptionEnabled(true);
      await Promise.all([
        refreshBoardFromEvents({ forceDecrypt: true, forceNewSignature }),
        refreshStrokeStats({ forceDecrypt: true, forceNewSignature }),
      ]);
    },
    [refreshBoardFromEvents, refreshStrokeStats]
  );

  return {
    contractAddress,
    canInteract,
    board,
    orderedCells,
    canvasSize,
    isLocked,
    statusMessage,
    isSyncing,
    isSubmitting,
    isDecrypting,
    selectedColor,
    setSelectedColor,
    refreshBoard: refreshBoardFromEvents,
    refreshCanvasMeta,
    refreshStrokeStats,
    paintPixel,
    lockCurrentCanvas,
    mintCanvasSnapshot,
    stats,
    tokenId,
    lastUpdatedAt,
    decryptionEnabled,
    enableDecryption,
  };
}

function normalizeColor(value: string | number | bigint | undefined) {
  if (value === undefined) return undefined;
  let numeric: bigint;
  if (typeof value === "string") {
    numeric = BigInt(value);
  } else if (typeof value === "number") {
    numeric = BigInt(value);
  } else {
    numeric = value;
  }
  const hex = numeric.toString(16).padStart(6, "0");
  return `#${hex.slice(-6)}`.toUpperCase();
}

function parseDecryptedNumber(value: string | number | bigint | undefined) {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    return Number(BigInt(value));
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  return Number(value);
}

