"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Users, Zap, Palette, Cpu, Trophy } from "lucide-react";

const featureCards = [
  {
    icon: Palette,
    title: "链上像素共创",
    description: "128×128 超大画布同步协作，实时观看每一笔创作被加密写入。支持缩放/投影模式，让像素艺术跃然屏幕。",
  },
  {
    icon: ShieldCheck,
    title: "FHE 隐私保护",
    description: "绘制过程全程使用 Fully Homomorphic Encryption。只有你与 Relayer 掌握密钥，合约端仅存储密文。",
  },
  {
    icon: Users,
    title: "社区驱动机制",
    description: "贡献者排行榜、点赞系统、多人协作模式，让每一次像素上链都有记录、有反馈。",
  },
  {
    icon: Trophy,
    title: "画布快照与 NFT",
    description: "锁定画布即可一键生成 IPFS 快照并铸造 NFT，保留参与者名单，创建独属于社区的链上藏品。",
  },
];

const workflow = [
  {
    step: "01",
    title: "连接钱包 & 选择链",
    detail:
      "本地开发时使用 Hardhat FHEVM Mock，部署到 Sepolia 时自动切换 Relayer SDK。导航栏实时显示链 ID 与 FHEVM 状态。",
  },
  {
    step: "02",
    title: "创作与加密提交",
    detail:
      "选择颜色、点击像素、输入通过 FHE 加密的密文，合约校验合法性后写入，同时更新贡献度与排行榜数据。",
  },
  {
    step: "03",
    title: "解密回看 & 协作",
    detail:
      "FHEVM 解密后渲染成炫彩像素，支持实时刷新、粒子动效与跨端协作。创作者还能在『我的创作』查看参与历史。",
  },
  {
    step: "04",
    title: "锁定画布、铸造 NFT",
    detail:
      "当画布达到理想状态，可锁定像素并写入 IPFS CID，一键铸造 PixelWall Canvas NFT 留作纪念。",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 pb-24">
      <section className="relative overflow-hidden rounded-[32px] border border-white/15 bg-[rgba(14,24,38,0.92)] px-10 py-16 shadow-[0_40px_90px_rgba(7,14,24,0.6)]">
        <div className="pixel-grid-bg opacity-30" />
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-wall-neon/30 blur-[110px]" />
        <div className="absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-wall-accent/25 blur-[140px]" />
        <div className="absolute inset-x-0 top-24 h-1/3 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_70%)]" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-start gap-6">
          <span className="badge shadow-[0_0_30px_rgba(76,201,240,0.35)]">
            <Sparkles className="h-4 w-4 text-wall-neon" />
            PixelWall Collaborative FHE Canvas
          </span>
          <h1 className="text-4xl font-bold leading-tight text-transparent drop-shadow-[0_14px_45px_rgba(76,201,240,0.35)] sm:text-5xl bg-gradient-to-r from-white via-wall-neon to-wall-accent bg-clip-text">
            像素画集体上链墙 · 用 FHE 打造极致隐私的链上协作体验
          </h1>
          <p className="max-w-2xl text-lg text-slate-200/90">
            聚合来自全球的创作者，通过 Fully Homomorphic Encryption
            把每一次像素绘制安全上链。无论是本地开发还是测试网协作，都能实时见证一幅数字艺术品的诞生。
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/canvas"
              className="glow-button floating inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-wall-neon to-cyan-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow-[0_0_45px_rgba(76,201,240,0.55)] transition hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(76,201,240,0.55)]"
            >
              进入创作画布
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-3 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10 hover:text-wall-neon"
            >
              浏览画布 NFT
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {featureCards.map((feature) => (
          <div
            key={feature.title}
            className="relative overflow-hidden rounded-3xl border border-white/12 bg-[rgba(10,18,30,0.85)] p-8 shadow-[0_22px_58px_rgba(7,14,26,0.45)] transition hover:-translate-y-1.5 hover:border-wall-neon/55 hover:shadow-[0_28px_68px_rgba(76,201,240,0.32)]"
          >
            <div className="noise-overlay" />
            <feature.icon className="h-10 w-10 text-wall-neon drop-shadow-[0_8px_18px_rgba(76,201,240,0.35)]" />
            <h3 className="mt-5 text-2xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{feature.description}</p>
            <span className="absolute -right-10 -bottom-12 h-36 w-36 rounded-full bg-wall-neon/20 blur-3xl" />
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/12 bg-[rgba(6,12,20,0.92)] p-10 shadow-[0_28px_70px_rgba(6,12,20,0.5)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-slate-400">Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">四步完成你的链上像素杰作</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              不论你是第一次接触 FHEVM 的开发者，还是冲着像素艺术而来的创作者，PixelWall
              都将以友好的流程与强大的工具帮助你快速上手、沉浸创作。
            </p>
          </div>
          <Link
            href="/canvas"
            className="inline-flex items-center gap-2 rounded-full border border-wall-accent/55 bg-wall-accent/25 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-wall-accent transition hover:bg-wall-accent/35 hover:text-white"
          >
            查看创作教程
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {workflow.map((item) => (
            <div
              key={item.step}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-6"
            >
              <span className="text-5xl font-black text-white/10">{item.step}</span>
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/12 bg-[rgba(8,14,23,0.9)] p-6 shadow-[0_24px_60px_rgba(8,14,23,0.45)] transition hover:-translate-y-1.5 hover:border-wall-neon/45">
          <h3 className="text-xl font-semibold text-white">实时数据看板</h3>
          <p className="mt-2 text-sm text-slate-300">
            从链上读取画布数量、累计像素笔画、创作者人数与点赞排行，让每一次合作都有迹可循。
          </p>
          <Link
            href="/canvas"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs uppercase tracking-wide text-white transition hover:border-wall-neon/45 hover:text-wall-neon"
          >
            打开画布
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-3xl border border-white/12 bg-[rgba(8,14,23,0.9)] p-6 shadow-[0_24px_60px_rgba(8,14,23,0.45)] transition hover:-translate-y-1.5 hover:border-wall-neon/45">
          <h3 className="text-xl font-semibold text-white">加密艺术展厅</h3>
          <p className="mt-2 text-sm text-slate-300">
            浏览历史上链画布的快照、NFT 铸造记录与参与者列表，为你的收藏灵感提供素材与灵感。
          </p>
          <Link
            href="/gallery"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs uppercase tracking-wide text-white transition hover:border-wall-neon/45 hover:text-wall-neon"
          >
            前往展厅
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-3xl border border-white/12 bg-[rgba(8,14,23,0.9)] p-6 shadow-[0_24px_60px_rgba(8,14,23,0.45)] transition hover:-translate-y-1.5 hover:border-wall-neon/45">
          <h3 className="text-xl font-semibold text-white">我的创作足迹</h3>
          <p className="mt-2 text-sm text-slate-300">
            自动记录你绘制过的像素、贡献度与点赞数，生成个人专属的链上像素时间轴。
          </p>
          <Link
            href="/my-creations"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs uppercase tracking-wide text-white transition hover:border-wall-neon/45 hover:text-wall-neon"
          >
            查看我的像素
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/12 bg-gradient-to-br from-[rgba(18,30,48,0.95)] via-[rgba(8,14,24,0.92)] to-[rgba(6,10,18,0.92)] p-10 text-center shadow-[0_32px_80px_rgba(7,14,26,0.55)]">
        <h2 className="text-3xl font-semibold text-white">准备好开启你的像素创作旅程了吗？</h2>
        <p className="mt-3 text-sm text-slate-300">
          连接钱包即可体验 FHEVM 带来的加密协作。无论是黑客松 Demo，还是 DAO 社区项目，PixelWall
          都将是你制作链上艺术的极佳工具。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/canvas"
            className="glow-button inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-wall-neon to-cyan-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 transition hover:-translate-y-1.5 hover:shadow-[0_20px_55px_rgba(76,201,240,0.55)]"
          >
            立即创作
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="https://docs.zama.ai"
            target="_blank"
            className="inline-flex items-center gap-3 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white/45 hover:bg-white/10 hover:text-wall-neon"
          >
            查看 FHEVM 文档
          </Link>
        </div>
      </section>
    </div>
  );
}

