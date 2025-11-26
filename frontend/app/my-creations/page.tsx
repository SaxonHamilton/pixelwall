"use client";

import Link from "next/link";
import { Fragment, useCallback, useMemo } from "react";
import { Sparkles, Clock3, Heart, Grid2X2, ArrowRight } from "lucide-react";
import { PixelWallProvider, usePixelWallContext } from "@/contexts/PixelWallContext";
import { useAppWeb3 } from "@/contexts/AppWeb3Context";
import { normalizeAddress } from "@/utils/addresses";

function MyCreationsInner() {
  const {
    orderedCells,
    stats,
    canvasSize,
    decryptionEnabled,
    enableDecryption,
    isDecrypting,
    isSyncing,
    statusMessage,
  } = usePixelWallContext();
  const { accounts, chainId } = useAppWeb3();
  const account = accounts?.[0];

  const contributions = useMemo(() => {
    if (!account) return [];
    return orderedCells
      .filter((cell) => normalizeAddress(cell.painter) === normalizeAddress(account))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [account, orderedCells]);

  const summary = useMemo(
    () => ({
      totalPixels: contributions.length,
      latest: contributions[0],
      userStrokes: decryptionEnabled ? stats.userStrokes ?? 0 : undefined,
      totalStrokes: decryptionEnabled ? stats.totalStrokes ?? 0 : undefined,
    }),
    [contributions, decryptionEnabled, stats]
  );

  const handleManualDecrypt = useCallback(async () => {
    try {
      await enableDecryption({ forceNewSignature: true });
    } catch (error) {
      console.error("[MyCreations] enableDecryption", error);
    }
  }, [enableDecryption]);

  const decrypting = isDecrypting || isSyncing;

  return (
    <div className="space-y-12 pb-24">
      <section className="relative overflow-hidden rounded-3xl border border-white/12 bg-[rgba(8,14,24,0.9)] px-8 py-12 shadow-[0_24px_70px_rgba(7,14,26,0.45)]">
        <div className="pixel-grid-bg" />
        <div className="noise-overlay" />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="badge">
              <Grid2X2 className="h-4 w-4 text-wall-neon" />
              Creation Archive
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-white">我的像素创作足迹</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              这里展示了你在 PixelWall 画布上的所有绘制记录。每一个像素都带有链上时间戳，可以追溯到具体的区块与颜色。
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300 backdrop-blur">
              <div>当前钱包：{account ?? "未连接"}</div>
              <div>当前链：{chainId ?? "未连接"}</div>
              <div>
                画布尺寸：{canvasSize.width} × {canvasSize.height}
              </div>
            </div>
            <button
              type="button"
              onClick={handleManualDecrypt}
              disabled={decrypting || !account}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-wall-neon/60 bg-wall-neon/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-wall-neon transition hover:bg-wall-neon/25 hover:text-white disabled:cursor-not-allowed disabled:border-white/20 disabled:text-slate-400"
            >
              {decryptionEnabled ? "重新解密" : "解密我的数据"}
              <Sparkles className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs text-slate-400">
              {statusMessage}
              {!decryptionEnabled && " · 点击按钮后 MetaMask 会请求一次解密签名"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[rgba(12,20,32,0.85)] p-6 shadow-[0_16px_52px_rgba(7,14,26,0.45)]">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">总像素</h3>
          <p className="mt-4 text-4xl font-semibold text-white">{summary.totalPixels}</p>
          <p className="mt-2 text-xs text-slate-400">你在当前画布中绘制的像素总数</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[rgba(12,20,32,0.85)] p-6 shadow-[0_16px_52px_rgba(7,14,26,0.45)]">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">累计笔画</h3>
          <p className="mt-4 text-4xl font-semibold text-white">
            {summary.userStrokes ?? "—"}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            FHE 解密统计的个人参与次数
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[rgba(12,20,32,0.85)] p-6 shadow-[0_16px_52px_rgba(7,14,26,0.45)]">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">全局笔画</h3>
          <p className="mt-4 text-4xl font-semibold text-white">
            {summary.totalStrokes ?? "—"}
          </p>
          <p className="mt-2 text-xs text-slate-400">当前画布的总协作次数</p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[rgba(8,14,24,0.85)] p-8 shadow-[0_22px_60px_rgba(7,14,26,0.45)]">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">时间线</h2>
          <Link
            href="/canvas"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-white transition hover:border-wall-neon/40 hover:text-wall-neon"
          >
            返回画布
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {account ? (
          contributions.length > 0 ? (
            <ul className="mt-6 space-y-5">
              {contributions.map((cell, index) => (
                <li
                  key={`${cell.x}-${cell.y}-${cell.updatedAt}-${index}`}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-sm text-slate-200 backdrop-blur md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-[rgba(10,18,32,0.88)] font-mono text-xs text-slate-400">
                      {cell.x},{cell.y}
                    </span>
                    <div>
                      <p>
                        像素颜色：{" "}
                        <span className="font-mono text-wall-neon">{cell.color ?? "密文待解密"}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        更新时间：{cell.updatedAt ? new Date(cell.updatedAt * 1000).toLocaleString() : "未知"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                      <Clock3 className="h-3 w-3" />
                      最新区块
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                      <Heart className="h-3 w-3" />
                      创作中
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-wall-neon/45 bg-wall-neon/10 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-wall-neon">暂未绘制像素</p>
              <p className="mt-2 text-sm text-wall-neon/70">
                立即前往画布页面，提交你的第一笔 FHE 加密像素。
              </p>
              <Link
                href="/canvas"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-wall-neon px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900"
              >
                去创作
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/6 px-6 py-12 text-center text-slate-300 backdrop-blur">
            需要连接钱包后才能查看你的像素历史。请点击导航栏的“连接 MetaMask”按钮完成授权。
          </div>
        )}
      </section>
    </div>
  );
}

export default function MyCreationsPage() {
  return (
    <PixelWallProvider autoDecrypt={false}>
      <MyCreationsInner />
    </PixelWallProvider>
  );
}

