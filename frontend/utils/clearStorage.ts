/**
 * 清理localStorage中的FHEVM相关数据
 * 当遇到QuotaExceededError时使用
 */
export function clearFhevmStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  console.log("[clearFhevmStorage] Clearing FHEVM-related localStorage data...");

  const keysToRemove: string[] = [];
  
  // 收集所有FHEVM相关的键
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && (
      key.includes("fhevm") || 
      key.includes("pixelwall") || 
      key.includes("public-keys")
    )) {
      keysToRemove.push(key);
    }
  }

  // 删除收集到的键
  keysToRemove.forEach(key => {
    window.localStorage.removeItem(key);
    console.log(`[clearFhevmStorage] Removed: ${key}`);
  });

  console.log(`[clearFhevmStorage] Cleared ${keysToRemove.length} items`);
}

/**
 * 获取localStorage使用情况的估算
 */
export function getStorageUsage(): { used: number; available: number; percentage: number } {
  if (typeof window === "undefined") {
    return { used: 0, available: 0, percentage: 0 };
  }

  let totalSize = 0;
  
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key) {
      const value = window.localStorage.getItem(key);
      if (value) {
        // 每个字符大约2字节（UTF-16）
        totalSize += (key.length + value.length) * 2;
      }
    }
  }

  // 大多数浏览器的localStorage限制是5MB
  const available = 5 * 1024 * 1024;
  const percentage = (totalSize / available) * 100;

  return {
    used: totalSize,
    available,
    percentage: Math.round(percentage * 100) / 100
  };
}

/**
 * 在浏览器控制台中可以直接调用的清理函数
 */
if (typeof window !== "undefined") {
  (window as any).clearFhevmStorage = clearFhevmStorage;
  (window as any).getStorageUsage = getStorageUsage;
}

