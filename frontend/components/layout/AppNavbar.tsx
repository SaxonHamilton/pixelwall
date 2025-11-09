"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Palette, Grid2X2, Trophy, Home, Wallet2 } from "lucide-react";
import { useAppWeb3 } from "@/contexts/AppWeb3Context";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "概览", icon: Home },
  { href: "/canvas", label: "创作画布", icon: Palette },
  { href: "/my-creations", label: "我的创作", icon: Grid2X2 },
  { href: "/gallery", label: "画布 NFT", icon: Trophy },
];

export function AppNavbar() {
  const pathname = usePathname();
  const { isConnected, accounts, connect, chainId, fhevmStatus } = useAppWeb3();

  const currentAccount = accounts?.[0];
  const displayAccount = currentAccount
    ? `${currentAccount.slice(0, 6)}…${currentAccount.slice(-4)}`
    : "连接 MetaMask";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(8,14,23,0.78)] backdrop-blur-xl shadow-[0_10px_60px_rgba(7,15,28,0.45)]">
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <span className="orbit-glow -left-10 top-0 h-32 w-32" />
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-wall-accent to-wall-neon text-white shadow-[0_0_25px_rgba(76,201,240,0.45)] transition group-hover:-translate-y-1 group-hover:shadow-[0_18px_45px_rgba(76,201,240,0.45)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400">
              PixelWall
            </span>
            <span className="text-lg font-semibold text-white">FHE 创作空间</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1 py-1 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-wide transition",
                  isActive
                    ? "bg-white text-slate-900 shadow-[0_0_18px_rgba(76,201,240,0.45)]"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className={clsx("h-4 w-4", isActive ? "text-slate-900" : "text-wall-neon")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden flex-col text-right text-xs text-slate-400 sm:flex">
            <span>FHEVM 状态：{fhevmStatus}</span>
            <span>Chain：{chainId ?? "未连接"}</span>
          </div>
          <button
            onClick={connect}
            className={clsx(
              "glow-button inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wider transition",
              isConnected
                ? "border-wall-neon/50 bg-wall-neon/20 text-wall-neon hover:bg-wall-neon/30"
                : "border-wall-accent/60 bg-wall-accent/25 text-wall-accent hover:bg-wall-accent/35"
            )}
          >
            <Wallet2 className="h-4 w-4" />
            {displayAccount}
          </button>
        </div>
      </div>
    </header>
  );
}

