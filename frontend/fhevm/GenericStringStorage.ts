export interface GenericStringStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class MemoryStringStorage implements GenericStringStorage {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}

class LocalStorageStringStorage implements GenericStringStorage {
  constructor(private readonly storage: Storage) {}

  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error("[LocalStorageStringStorage] getItem failed", error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.error("[LocalStorageStringStorage] setItem failed", error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error("[LocalStorageStringStorage] removeItem failed", error);
    }
  }
}

let sharedPersistentStorage: GenericStringStorage | null = null;

export function createMemoryStorage(): GenericStringStorage {
  return new MemoryStringStorage();
}

export function createPersistentStorage(): GenericStringStorage {
  if (sharedPersistentStorage) {
    return sharedPersistentStorage;
  }

  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    sharedPersistentStorage = new MemoryStringStorage();
    return sharedPersistentStorage;
  }

  sharedPersistentStorage = new LocalStorageStringStorage(window.localStorage);
  return sharedPersistentStorage;
}

