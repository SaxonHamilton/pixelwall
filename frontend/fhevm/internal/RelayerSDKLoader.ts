import { FhevmRelayerSDKType, FhevmWindowType } from "./fhevmTypes";
import { SDK_CDN_URL, SDK_LOCAL_URL } from "./constants";

type TraceType = (message?: unknown, ...optionalParams: unknown[]) => void;

export class RelayerSDKLoader {
  private _trace?: TraceType;

  constructor(options: { trace?: TraceType }) {
    this._trace = options.trace;
  }

  public isLoaded() {
    if (typeof window === "undefined") {
      throw new Error("RelayerSDKLoader: can only be used in the browser.");
    }
    return isFhevmWindowType(window, this._trace);
  }

  public load(): Promise<void> {
    if (typeof window === "undefined") {
      return Promise.reject(
        new Error("RelayerSDKLoader: can only be used in the browser.")
      );
    }

    if ("relayerSDK" in window) {
      if (!isFhevmRelayerSDKType(window.relayerSDK, this._trace)) {
        throw new Error("RelayerSDKLoader: Unable to load FHEVM Relayer SDK");
      }
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const loadedOk = () => {
        if (!isFhevmWindowType(window, this._trace)) {
          reject(
            new Error(
              "RelayerSDKLoader: window object does not contain a valid relayerSDK object."
            )
          );
        }
        resolve();
      };

      const alreadyLoadedFrom = (src: string) =>
        document.querySelector(`script[src="${src}"]`);

      const tryLoad = (src: string, onFail?: () => void) => {
        const existingScript = alreadyLoadedFrom(src);
        if (existingScript) {
          loadedOk();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.type = "text/javascript";
        script.async = true;

        script.onload = () => {
          this._trace?.(`[RelayerSDKLoader] Successfully loaded from ${src}`);
          loadedOk();
        };

        script.onerror = () => {
          this._trace?.(`[RelayerSDKLoader] Failed to load from ${src}`);
          if (onFail) {
            onFail();
          } else {
            reject(new Error(`RelayerSDKLoader: Failed to load ${src}`));
          }
        };

        document.head.appendChild(script);
      };

      // Prefer CDN, fallback to local copy in /public
      tryLoad(SDK_CDN_URL, () =>
        tryLoad(SDK_LOCAL_URL, () =>
          reject(
            new Error(
              `RelayerSDKLoader: Failed to load Relayer SDK from both CDN (${SDK_CDN_URL}) and local (${SDK_LOCAL_URL})`
            )
          )
        )
      );
    });
  }
}

function isFhevmRelayerSDKType(
  o: unknown,
  trace?: TraceType
): o is FhevmRelayerSDKType {
  if (typeof o === "undefined") {
    trace?.("RelayerSDKLoader: relayerSDK is undefined");
    return false;
  }
  if (o === null) {
    trace?.("RelayerSDKLoader: relayerSDK is null");
    return false;
  }
  if (typeof o !== "object") {
    trace?.("RelayerSDKLoader: relayerSDK is not an object");
    return false;
  }
  if (!objHasProperty(o, "initSDK", "function", trace)) {
    return false;
  }
  if (!objHasProperty(o, "createInstance", "function", trace)) {
    return false;
  }
  if (!objHasProperty(o, "SepoliaConfig", "object", trace)) {
    return false;
  }
  return true;
}

export function isFhevmWindowType(
  win: unknown,
  trace?: TraceType
): win is FhevmWindowType {
  if (typeof win === "undefined") {
    trace?.("RelayerSDKLoader: window object is undefined");
    return false;
  }
  if (win === null) {
    trace?.("RelayerSDKLoader: window object is null");
    return false;
  }
  if (typeof win !== "object") {
    trace?.("RelayerSDKLoader: window is not an object");
    return false;
  }
  if (!("relayerSDK" in win)) {
    trace?.("RelayerSDKLoader: window missing relayerSDK property");
    return false;
  }
  return isFhevmRelayerSDKType(win.relayerSDK, trace);
}

function objHasProperty<
  T extends object,
  K extends PropertyKey,
  V extends string
>(obj: T, propertyName: K, propertyType: V, trace?: TraceType): obj is T &
  Record<
    K,
    V extends "string"
      ? string
      : V extends "number"
      ? number
      : V extends "object"
      ? object
      : V extends "boolean"
      ? boolean
      : V extends "function"
      ? (...args: any[]) => any
      : unknown
  > {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  if (!(propertyName in obj)) {
    trace?.(`RelayerSDKLoader: missing ${String(propertyName)}.`);
    return false;
  }

  const value = (obj as Record<K, unknown>)[propertyName];

  if (value === null || value === undefined) {
    trace?.(`RelayerSDKLoader: ${String(propertyName)} is null or undefined.`);
    return false;
  }

  if (typeof value !== propertyType) {
    trace?.(
      `RelayerSDKLoader: ${String(propertyName)} is not a ${propertyType}.`
    );
    return false;
  }

  return true;
}

