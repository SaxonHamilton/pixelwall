"use client";

import clsx from "clsx";
import { Loader2, Lock, RefreshCw, Sparkle, Upload } from "lucide-react";

type ActionPanelProps = {
  isSubmitting: boolean;
  isDecrypting: boolean;
  isSyncing: boolean;
  isLocked: boolean;
  statusMessage: string;
  onRefresh: () => void;
  onLock: () => void;
  onMint: () => void;
};

export function ActionPanel({
  isSubmitting,
  isDecrypting,
  isSyncing,
  isLocked,
  statusMessage,
  onRefresh,
  onLock,
  onMint,
}: ActionPanelProps) {
  const loading = isSubmitting || isDecrypting || isSyncing;

  return (
    <div className="glass-panel flex flex-col gap-4 px-6 py-5 text-sm text-slate-200 shadow-[0_16px_48px_rgba(7,14,24,0.45)] md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-wall-neon" />
        ) : (
          <Sparkle className="h-4 w-4 text-wall-neon" />
        )}
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">
          Live Status
        </span>
        <span className="text-base text-white">{statusMessage}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onRefresh}
          className="group inline-flex items-center gap-2 rounded-full border border-[rgba(76,201,240,0.45)] bg-[rgba(76,201,240,0.12)] px-4 py-2 text-xs uppercase tracking-widest text-wall-neon transition hover:border-wall-accent hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 group-hover:text-wall-accent" />
          刷新
        </button>
        <button
          onClick={onLock}
          disabled={isLocked}
          className={clsx(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition",
            isLocked
              ? "cursor-not-allowed border-slate-600 bg-slate-700/40 text-slate-400"
              : "border-wall-accent/40 bg-wall-accent/20 text-wall-accent hover:border-wall-accent hover:bg-wall-accent/40 hover:text-white"
          )}
        >
          <Lock className="h-3.5 w-3.5" />
          锁定画布
        </button>
        <button
          onClick={onMint}
          className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-200/12 px-4 py-2 text-xs uppercase tracking-widest text-amber-100 transition hover:bg-amber-200/30 hover:text-black"
        >
          <Upload className="h-3.5 w-3.5" />
          铸造 NFT
        </button>
      </div>
    </div>
  );
}

