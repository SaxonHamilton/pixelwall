"use client";

import { Wallet } from "lucide-react";

type CanvasHeaderProps = {
  isConnected: boolean;
  account?: string;
  onConnect: () => Promise<void> | void;
  chainId?: number;
};

export function CanvasHeader({
  isConnected,
  account,
  onConnect,
  chainId,
}: CanvasHeaderProps) {
  const shortAccount = account
    ? `${account.slice(0, 6)}…${account.slice(-4)}`
    : undefined;

  return (
    <header className="flex items-center justify-between rounded-2xl border border-[rgba(76,201,240,0.35)] bg-[rgba(13,27,42,0.64)] px-8 py-6 shadow-neon">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-wall-neon">
          PixelWall Collaborative FHE Canvas
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          像素画集体上链墙
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-300">
          与全球创作者一起，用 Fully Homomorphic Encryption 保护你的创意隐私，
          在加密状态下实时协作绘制赛博像素艺术。
        </p>
      </div>
      <button
        onClick={() => onConnect()}
        className="group flex items-center gap-3 rounded-full border border-[rgba(76,201,240,0.4)] bg-[rgba(76,201,240,0.12)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-wall-neon transition hover:border-wall-accent hover:text-white"
      >
        <Wallet className="h-4 w-4 transition group-hover:text-wall-accent" />
        {isConnected
          ? shortAccount ?? "Connected"
          : "连接 MetaMask"}
        {chainId && (
          <span className="rounded-full border border-[rgba(76,201,240,0.3)] bg-[rgba(12,18,30,0.8)] px-2 py-0.5 text-[10px] uppercase text-slate-300">
            Chain {chainId}
          </span>
        )}
      </button>
    </header>
  );
}

