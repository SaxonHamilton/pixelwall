"use client";

import clsx from "clsx";

const PRESET_COLORS = [
  "#F72585",
  "#7209B7",
  "#3A0CA3",
  "#4361EE",
  "#4CC9F0",
  "#48BFE3",
  "#56CFE1",
  "#64DFDF",
  "#72EFDD",
  "#80FFDB",
  "#FF9F1C",
  "#FFE45E",
  "#FB5607",
  "#FF006E",
  "#8338EC",
  "#3A86FF",
];

type ColorPaletteProps = {
  selectedColor: string;
  onSelect: (hex: string) => void;
};

export function ColorPalette({ selectedColor, onSelect }: ColorPaletteProps) {
  return (
    <div className="glass-panel p-6 shadow-[0_16px_48px_rgba(7,14,24,0.45)]">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">Neon Palette</p>
      <h3 className="mt-2 text-lg font-semibold text-white">调色板</h3>
      <div className="mt-5 grid grid-cols-8 gap-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={clsx(
              "relative h-11 w-11 rounded-md transition duration-200 shadow-[0_0_18px_rgba(10,20,32,0.5)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wall-neon focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(13,27,42,0.6)]",
              selectedColor === color
                ? "ring-2 ring-wall-accent ring-offset-2 ring-offset-[rgba(13,27,42,0.6)]"
                : "hover:scale-105"
            )}
            style={{ backgroundColor: color }}
          >
            {selectedColor === color && (
              <span className="pointer-events-none absolute inset-0 rounded-md border border-white/70 shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-white/10 bg-[rgba(9,15,23,0.75)] p-4 text-sm text-slate-300">
        当前颜色：
        <span className="ml-2 font-mono text-white">{selectedColor}</span>
      </div>
    </div>
  );
}

