const STORAGE_KEY = "pixelwall:fhevm:public-keys";

type PublicKeyEntry = {
  publicKey: Uint8Array;
  publicParams: Uint8Array;
};

function loadMap(): Record<string, PublicKeyEntry> {
  if (typeof window === "undefined") {
    return {};
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as Record<
      string,
      { publicKey: string | number[]; publicParams: number[] }
    >;
    const out: Record<string, PublicKeyEntry> = {};
    for (const [key, value] of Object.entries(parsed)) {
      // v0.2 旧结构: publicKey 为 string（不兼容）→ 丢弃
      if (typeof value.publicKey === "string") {
        continue;
      }
      const pkArray = Array.isArray(value.publicKey)
        ? new Uint8Array(value.publicKey)
        : value.publicKey;
      const paramsArray = new Uint8Array(value.publicParams);
      out[key] = { publicKey: pkArray, publicParams: paramsArray };
    }
    return out;
  } catch (error) {
    console.warn("[PublicKeyStorage] parse error", error);
    return {};
  }
}

export async function publicKeyStorageGet(aclAddress: string): Promise<PublicKeyEntry> {
  const map = loadMap();
  if (!map[aclAddress]) {
    throw new Error("FHEVM ACL public key not cached yet.");
  }
  return map[aclAddress];
}

export async function publicKeyStorageSet(
  aclAddress: string,
  publicKey: Uint8Array,
  publicParams: Uint8Array
) {
  if (typeof window === "undefined") {
    return;
  }
  
  // 只保留当前地址的公钥，避免累积过多数据导致配额超出
  const newMap: Record<string, PublicKeyEntry> = {
    [aclAddress]: { publicKey, publicParams }
  };
  
  const serialized = JSON.stringify({
    [aclAddress]: {
      publicKey: Array.from(publicKey),
      publicParams: Array.from(publicParams),
    }
  });
  
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    // 如果仍然配额超出，清空localStorage中的所有FHEVM相关数据后重试
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('[PublicKeyStorage] QuotaExceededError, clearing old data...');
      
      try {
        // 清除旧的公钥数据
        window.localStorage.removeItem(STORAGE_KEY);
        
        // 尝试清除其他可能的FHEVM相关数据
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && (key.includes('fhevm') || key.includes('pixelwall'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => window.localStorage.removeItem(key));
        
        // 重试保存
        window.localStorage.setItem(STORAGE_KEY, serialized);
        console.log('[PublicKeyStorage] Successfully saved after clearing old data');
      } catch (retryError) {
        console.error('[PublicKeyStorage] Failed to save even after clearing:', retryError);
        // 即使保存失败，也不抛出错误，让应用继续运行
        // FHEVM可以在没有缓存的情况下工作，只是会慢一些
      }
    } else {
      console.error('[PublicKeyStorage] Unexpected error:', error);
    }
  }
}

