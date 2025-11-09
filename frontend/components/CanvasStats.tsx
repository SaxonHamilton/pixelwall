"use client";

import { Sparkle, Trophy, Users } from "lucide-react";
import { CanvasStats } from "@/hooks/usePixelWall";

type CanvasStatsProps = {
  stats: CanvasStats;
  lastUpdatedAt?: number;
  isLocked: boolean;
  tokenId?: number;
};

export function CanvasStatsPanel({
  stats,
  lastUpdatedAt,
  isLocked,
  tokenId,
}: CanvasStatsProps) {
  return (
    <div className="glass-panel flex flex-col gap-4 p-6 text-sm text-slate-200 shadow-[0_16px_48px_rgba(7,14,24,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">
            Canvas Pulse
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">画布动态</h3>
        </div>
          <span className="rounded-full border border-[rgba(76,201,240,0.35)] bg-[rgba(12,18,30,0.8)] px-3 py-1 text-xs uppercase tracking-wide text-slate-300 shadow-[0_0_16px_rgba(76,201,240,0.15)]">
          {isLocked ? "🔒 Locked" : "🟢 Live"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Sparkle className="h-4 w-4 text-wall-neon" />}
          label="累计笔画"
          value={stats.totalStrokes ?? 0}
        />
        <StatCard
          icon={<Users className="h-4 w-4 text-wall-accent" />}
          label="我的贡献"
          value={stats.userStrokes ?? 0}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4 text-amber-400" />}
          label="NFT Token"
          value={tokenId !== undefined ? `#${tokenId}` : "-"}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-[rgba(10,16,25,0.7)] px-4 py-3 text-xs text-slate-400">
        上次操作时间：
        <span className="ml-2 font-mono text-slate-200">
          {lastUpdatedAt
            ? formatTimestamp(lastUpdatedAt)
            : "尚未开始创作"}
        </span>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
};

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-[rgba(9,14,22,0.7)] px-3 py-4 shadow-[0_12px_34px_rgba(7,14,24,0.35)]">
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400">
        {icon}
        {label}
      </span>
      <span className="font-mono text-lg text-white">{value}</span>
    </div>
  );
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

