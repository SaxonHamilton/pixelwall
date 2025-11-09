"use client";

import Link from "next/link";
import { useMemo, useCallback } from "react";
import { Brush, RefreshCw, Lock, Upload, Sparkles } from "lucide-react";
import { PixelWallProvider, usePixelWallContext } from "@/contexts/PixelWallContext";
import { useAppWeb3 } from "@/contexts/AppWeb3Context";
import { CanvasBoard } from "@/components/CanvasBoard";
import { ColorPalette } from "@/components/ColorPalette";
import { CanvasStatsPanel } from "@/components/CanvasStats";
import { ActionPanel } from "@/components/ActionPanel";

function CanvasInner() {
  const {
    contractAddress,
    orderedCells,
    canvasSize,
    selectedColor,
    setSelectedColor,
    canInteract,
    isLocked,
    paintPixel,
    isSubmitting,
    isDecrypting,
    isSyncing,
    statusMessage,
    refreshBoard,
    refreshStrokeStats,
    lockCurrentCanvas,
    mintCanvasSnapshot,
    stats,
    tokenId,
    lastUpdatedAt,
  } = usePixelWallContext();
  const { chainId, accounts, fhevmStatus } = useAppWeb3();

  const isConnected = Boolean(accounts && accounts.length > 0);

  const handleMint = useCallback(async () => {
    const cid = window.prompt("请输入画布快照的 IPFS CID：");
    if (!cid) return;
    await mintCanvasSnapshot(cid.trim());
  }, [mintCanvasSnapshot]);

  const contributionTips = useMemo(
    () => [
      "画布更新以 FHE 密文存储并审核，确保每个像素都来源可追溯。",
      "同一钱包存在绘制冷却时间（默认 60 秒），以防止 Spam。",
      "锁定画布后可选择铸造 NFT，并在展厅页面查看历史快照。",
    ],
    []
  );

  return (
    <div className="space-y-10 pb-24">
      <section className="relative overflow-hidden rounded-3xl border border-white/12 bg-[rgba(10,18,30,0.92)] px-8 py-10 shadow-[0_20px_65px_rgba(12,24,40,0.45)]">
        <div className="pixel-grid-bg" />
        <div className="noise-overlay" />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="badge">
              <Brush className="h-4 w-4 text-wall-neon" />
              Canvas Playground
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-white">像素画布 · Canvas #1</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              连接 MetaMask 后即可开始创作。当前页面联动 FHEVM 实例，所有像素颜色会以密文方式提交，防止数据被窥探。
            </p>
          </div>
          <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
            <div>链 ID：{chainId ?? "未连接"}</div>
            <div>FHEVM 状态：{fhevmStatus}</div>
            <div>合约地址：{contractAddress ?? "未部署"}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[rgba(8,14,23,0.88)] p-6 shadow-[0_22px_60px_rgba(6,12,20,0.45)]">
            <div className="pixel-grid-bg opacity-20" />
            <CanvasBoard
              cells={orderedCells}
              width={canvasSize.width}
              height={canvasSize.height}
              selectedColor={selectedColor}
              disabled={!canInteract || isLocked}
              onPaint={paintPixel}
            />
          </div>
          <ActionPanel
            isSubmitting={isSubmitting}
            isDecrypting={isDecrypting}
            isSyncing={isSyncing}
            isLocked={isLocked}
            statusMessage={statusMessage}
            onRefresh={() => {
              refreshBoard();
              refreshStrokeStats();
            }}
            onLock={lockCurrentCanvas}
            onMint={handleMint}
          />
        </div>
        <aside className="space-y-6">
          <ColorPalette selectedColor={selectedColor} onSelect={setSelectedColor} />
          <CanvasStatsPanel
            stats={stats}
            lastUpdatedAt={lastUpdatedAt}
            isLocked={isLocked}
            tokenId={tokenId}
          />
          <div className="glass-panel space-y-3 p-6 text-sm leading-relaxed text-slate-300">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Sparkles className="h-4 w-4 text-wall-neon" />
              创作小贴士
            </h3>
            <ul className="space-y-2">
              {contributionTips.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
            {!isConnected && (
              <p className="rounded-xl border border-wall-accent/40 bg-wall-accent/20 px-3 py-2 text-xs text-wall-accent">
                尚未连接钱包。请点击导航栏“连接 MetaMask”按钮完成授权。
              </p>
            )}
          </div>
          <div className="glass-panel grid gap-4 p-6 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">快速导航</span>
              <Link
                href="/my-creations"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-wall-neon hover:text-white"
              >
                我的创作
                <RefreshCw className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <Link
                href="/my-creations"
                className="rounded-full border border-white/20 px-3 py-1 text-slate-200 hover:border-wall-neon/40 hover:text-wall-neon"
              >
                我的像素记录
              </Link>
              <Link
                href="/gallery"
                className="rounded-full border border-white/20 px-3 py-1 text-slate-200 hover:border-wall-neon/40 hover:text-wall-neon"
              >
                画布 NFT 展厅
              </Link>
              <a
                href="https://docs.zama.ai"
                target="_blank"
                className="rounded-full border border-white/20 px-3 py-1 text-slate-200 hover:border-wall-neon/40 hover:text-wall-neon"
                rel="noreferrer"
              >
                FHEVM 指南
              </a>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default function CanvasPage() {
  return (
    <PixelWallProvider>
      <CanvasInner />
    </PixelWallProvider>
  );
}

