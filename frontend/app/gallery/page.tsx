"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Images, ShieldCheck, ArrowRight } from "lucide-react";
import { PixelWallProvider, usePixelWallContext } from "@/contexts/PixelWallContext";
import { useAppWeb3 } from "@/contexts/AppWeb3Context";

function GalleryInner() {
  const { tokenId, isLocked, stats, contractAddress, lastUpdatedAt } = usePixelWallContext();
  const { chainId } = useAppWeb3();

  const minted = typeof tokenId === "number" && tokenId > 0;

  const infoBlocks = useMemo(
    () => [
      {
        title: "画布状态",
        value: isLocked ? "已锁定" : "开放创作中",
        description: isLocked
          ? "当前画布已停止修改，可进行快照导出与 NFT 铸造。"
          : "画布仍可继续绘制，锁定后才能铸造 NFT。",
      },
      {
        title: "累积笔画",
        value: stats.totalStrokes ?? 0,
        description: "来自所有创作者的像素笔画次数，数据完全由合约统计。",
      },
      {
        title: "我的贡献",
        value: stats.userStrokes ?? 0,
        description: "你在当前画布中的个人镜像。支持 FHE 解密后在『我的创作』查看详情。",
      },
    ],
    [isLocked, stats]
  );

  return (
    <div className="space-y-12 pb-24">
      <section className="relative overflow-hidden rounded-3xl border border-white/12 bg-[rgba(10,18,30,0.92)] px-8 py-12 shadow-[0_24px_70px_rgba(7,14,26,0.45)]">
        <div className="pixel-grid-bg" />
        <div className="noise-overlay" />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="badge">
              <Images className="h-4 w-4 text-wall-neon" />
              Canvas Gallery
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-white">画布快照与 NFT 展厅</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              浏览当前画布的加密状态、NFT 铸造记录与 IPFS 快照。每一次锁定都将生成独特的链上收藏。
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300 backdrop-blur">
            <div>当前链：{chainId ?? "未知"}</div>
            <div>合约地址：{contractAddress ?? "未部署"}</div>
            <div>
              最近更新：{" "}
              {lastUpdatedAt ? new Date(lastUpdatedAt * 1000).toLocaleString() : "尚未解锁"}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {infoBlocks.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-white/10 bg-[rgba(8,14,24,0.82)] p-6 shadow-[0_18px_52px_rgba(7,14,26,0.45)]"
          >
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.title}</h3>
            <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-xs text-slate-400">{item.description}</p>
          </div>
        ))}
        <div className="rounded-3xl border border-dashed border-wall-neon/45 bg-wall-neon/10 p-6">
          <h3 className="text-sm uppercase tracking-[0.3em] text-wall-neon">FHE 加密保障</h3>
          <p className="mt-4 text-sm text-wall-neon/80">
            画布像素存储的始终是密文。只有持有正确签名的用户才能解密，确保历史快照不会泄露创作者隐私。
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[rgba(8,14,24,0.88)] p-10 shadow-[0_24px_70px_rgba(7,14,26,0.45)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Canvas #1 · NFT 快照</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              当画布锁定并提供 IPFS CID 后，可在此处铸造 NFT。NFT 元数据将包含当前画布图像与贡献者列表。
            </p>
          </div>
          <Link
            href="/canvas"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide text-white transition hover:border-wall-neon/40 hover:text-wall-neon"
          >
            回到画布
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[rgba(76,201,240,0.12)] to-[rgba(247,37,133,0.12)] p-8 text-white shadow-[0_18px_60px_rgba(10,20,35,0.45)]">
            <h3 className="text-xl font-semibold">链上画布 NFT</h3>
            <p className="mt-2 text-sm text-white/80">
              铸造完成后，NFT 将记录在 PixelWallCanvas 合约中，可用于展示、交易或作为社区荣誉徽章。
            </p>
            <div className="mt-6 grid gap-3 text-sm text-white/90">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <span>Token ID</span>
                <span className="font-mono text-lg">
                  {minted ? `#${tokenId}` : "未铸造"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <span>铸造状态</span>
                <span className="font-mono">{minted ? "已完成" : "待铸造"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <span>画布状态</span>
                <span className="font-mono">{isLocked ? "已锁定" : "开放中"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-[rgba(10,18,30,0.9)] p-6 text-sm text-slate-200 shadow-[0_18px_52px_rgba(7,14,26,0.45)]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-10 w-10 text-wall-neon" />
              <div>
                <h4 className="text-lg font-semibold text-white">隐私友好的画布快照</h4>
                <p className="text-xs text-slate-300">
                  仅保存必要的链上信息，其他细节由 FHEVM 执行密文处理，保证贡献者身份匿名化展示。
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs text-slate-300">
                铸造流程：锁定画布 → 上传渲染图至 IPFS → 在画布页输入 CID → 调用 <code>mintCanvasNFT</code>{" "}
                完成铸造。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <Link
                href="/canvas"
                className="inline-flex items-center gap-2 rounded-full border border-wall-neon/40 px-3 py-1 text-wall-neon hover:border-wall-neon hover:text-white"
              >
                去锁定画布
              </Link>
              <Link
                href="https://docs.zama.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-slate-200 hover:border-white/40 hover:text-white"
              >
                阅读 FHEVM 文档
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[rgba(8,14,24,0.85)] px-8 py-10 text-center text-slate-200 shadow-[0_20px_60px_rgba(7,14,26,0.45)]">
        <h2 className="text-2xl font-semibold text-white">想让画布成为链上收藏吗？</h2>
        <p className="mt-3 text-sm">
          当你与伙伴创作完成后，记得锁定画布并铸造 NFT，我们将在展厅中展示它，同时保留所有贡献者的匿名签名。
        </p>
        <Link
          href="/canvas"
          className="glow-button mt-6 inline-flex items-center gap-2 rounded-full bg-wall-neon px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(76,201,240,0.45)]"
        >
          前往创作中心
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <PixelWallProvider>
      <GalleryInner />
    </PixelWallProvider>
  );
}

