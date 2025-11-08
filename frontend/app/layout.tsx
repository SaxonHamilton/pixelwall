"use client";

import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { AppNavbar } from "@/components/layout/AppNavbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-[radial-gradient(circle_at_top,_#1b263b,_#0d1b2a_55%)] min-h-screen text-white">
        <Providers>
          <div className="relative min-h-screen overflow-hidden">
            <span className="pointer-events-none absolute inset-0 bg-[url('/grid-noise.png')] opacity-40 mix-blend-soft-light" />
            <AppNavbar />
            <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-20 pt-12">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

