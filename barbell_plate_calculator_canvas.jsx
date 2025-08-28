import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

// --- Config ---
const DEFAULT_PLATES = [45, 35, 25, 10, 5, 2.5];
const COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6", "#22d3ee"];

// --- Utils ---
function roundTo(value, step = 0.5) {
  const inv = 1 / step;
  return Math.round(value * inv) / inv;
}

function parseNonNegInt(val, fallback = 0) {
  const n = Math.floor(Number(val));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function parseNonNegFloat(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function computeLayout({ target, bar, inventory }) {
  const needPerSide = (target - bar) / 2;
  if (needPerSide < 0) return { ok: false, perSide: {}, remainder: needPerSide };

  let remaining = needPerSide;
  const perSide = {};
  // Greedy from heavy to light
  const sizes = Object.keys(inventory).map(Number).sort((a, b) => b - a);

  for (const size of sizes) {
    const havePairs = Math.max(0, Number(inventory[size] || 0));
    if (!havePairs) continue;
    const neededPairs = Math.floor(remaining / size);
    const take = Math.min(havePairs, neededPairs);
    if (take > 0) {
      perSide[size] = take;
      remaining = roundTo(remaining - take * size, 0.5);
    }
  }

  const ok = Math.abs(remaining) < 1e-9;
  return { ok, perSide, remainder: remaining };
}

// Draw a rounded rect helper for label backgrounds
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function useCanvasDraw(perSide, barWeight) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Bigger canvas for readability
    const W = (canvas.width = 1700);
    const H = (canvas.height = 560);

    // Background
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0b1220");
    grad.addColorStop(1, "#111827");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const centerY = H / 2;
    const sleeveLength = 380;
    const barLength = W * 0.86;
    const barX = (W - barLength) / 2;
    const barH = 30;

    // Bar
    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(barX, centerY - barH / 2, barLength, barH);
    // Knurling
    ctx.fillStyle = "#6b7280";
    for (let x = barX + 40; x < barX + barLength - 40; x += 10) ctx.fillRect(x, centerY - 4, 3, 8);

    // Sleeves
    const leftSleeveStart = barX + 30;
    const rightSleeveEnd = barX + barLength - 30;
    ctx.fillStyle = "#d1d5db";
    ctx.fillRect(leftSleeveStart, centerY - 24, sleeveLength, 48);
    ctx.fillRect(rightSleeveEnd - sleeveLength, centerY - 24, sleeveLength, 48);

    // Order: lightest first to push them to the outside (heaviest stay inside)
    const sideSizes = Object.keys(perSide).map(Number).sort((a, b) => a - b);

    // Base gap, with extra spacing for very thin plates to avoid label collision
    const baseGap = 10;

    const drawSide = (isLeft) => {
      let accumulated = 0;
      sideSizes.forEach((size) => {
        const count = perSide[size] || 0;
        for (let i = 0; i < count; i++) {
          // Visual proportions
          const idx = DEFAULT_PLATES.indexOf(size);
          const color = COLORS[(idx >= 0 ? idx : 0) % COLORS.length];
          const thickness = Math.max(14, Math.min(52, size));
          const height = 220 + Math.min(150, size * 4);
          const y = centerY - height / 2;
          const gap = baseGap + (thickness < 20 ? 8 : 0); // extra space for 2.5s/5s
          const x = isLeft ? leftSleeveStart + 8 + accumulated : rightSleeveEnd - 8 - accumulated - thickness;

          // Plate body
          ctx.fillStyle = color;
          ctx.fillRect(x, y, thickness, height);
          // Inner inset for a bit of depth
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.fillRect(x + 3, y + 10, thickness - 6, height - 20);

          // Label with high-contrast badge to prevent collisions
          const label = String(size);
          ctx.font = "900 30px ui-sans-serif, system-ui, -apple-system";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const tw = ctx.measureText(label).width;
          const padX = 10, padY = 6;
          const badgeW = Math.max(tw + padX * 2, thickness - 4);
          const badgeH = 38;
          const cx = x + thickness / 2;
          const cy = y + height / 2;
          const bx = cx - badgeW / 2;
          const by = cy - badgeH / 2;

          // Semi-opaque dark badge with subtle border
          ctx.save();
          rr(ctx, bx, by, badgeW, badgeH, 8);
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(255,255,255,0.25)";
          ctx.stroke();
          ctx.restore();

          // Label text
          ctx.fillStyle = "#fff";
          ctx.fillText(label, cx, cy + 1);

          // Increment stack
          accumulated += thickness + gap;
        }
      });

      // Collar
      const collarW = 18;
      const collarH = 240;
      const cx = isLeft ? leftSleeveStart + accumulated + 8 : rightSleeveEnd - accumulated - 8 - collarW;
      const cy = centerY - collarH / 2;
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(cx, cy, collarW, collarH);
    };

    drawSide(true);
    drawSide(false);

    // HUD
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "600 28px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText(`Bar: ${barWeight} lb`, 16, 44);
  }, [perSide, barWeight]);

  return canvasRef;
}

export default function BarbellPlateCalculator() {
  // Keep raw input strings so deleting works naturally
  const [targetStr, setTargetStr] = useState("225");
  const [barStr, setBarStr] = useState("45");
  const [zoom, setZoom] = useState(100);

  // Inventory as strings for smooth typing/deleting
  const [inventoryStr, setInventoryStr] = useState(() => Object.fromEntries(DEFAULT_PLATES.map((s) => [s, "4"])));

  // Parsed values for computation (non-negative numbers)
  const target = useMemo(() => parseNonNegFloat(targetStr, 0), [targetStr]);
  const barWeight = useMemo(() => parseNonNegFloat(barStr, 45), [barStr]);
  const inventory = useMemo(() => {
    const obj = {};
    for (const s of DEFAULT_PLATES) obj[s] = parseNonNegInt(inventoryStr[s] ?? 0, 0);
    return obj;
  }, [inventoryStr]);

  const result = useMemo(() => computeLayout({ target, bar: barWeight, inventory }), [target, barWeight, inventory]);
  const canvasRef = useCanvasDraw(result.ok ? result.perSide : {}, barWeight);

  const colorForSize = (size) => COLORS[DEFAULT_PLATES.indexOf(size) % COLORS.length];
  const totalPlates = useMemo(() => Object.entries(result.ok ? result.perSide : {}).reduce((acc, [_, c]) => acc + c * 2, 0), [result]);

  // Handlers that allow empty string while typing
  const handleNumberInput = (setter) => (e) => {
    setter(e.target.value);
  };
  const commitNonNeg = (setter, fallback) => (e) => {
    const v = e.target.value.trim();
    if (v === "") setter(String(fallback));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 flex items-start justify-center p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Controls Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Barbell Plate Calculator</h1>
              <p className="text-slate-300 text-sm mt-1">Heaviest plates inside, small plates on the outside. Crisp canvas labels.</p>
            </div>
          </div>

          {/* Target & Bar */}
          <div className="mt-6 grid grid-cols-1 gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Target Weight (lb)</span>
              <input
                type="text"
                inputMode="decimal"
                value={targetStr}
                onChange={handleNumberInput(setTargetStr)}
                onBlur={commitNonNeg(setTargetStr, 0)}
                className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. 225"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-slate-300">Bar Weight (lb)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={barStr}
                  onChange={handleNumberInput(setBarStr)}
                  onBlur={commitNonNeg(setBarStr, 45)}
                  className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="45"
                />
              </label>
              <div className="flex gap-2 flex-wrap">
                {[45, 35, 33, 20].map((w) => (
                  <button
                    key={w}
                    onClick={() => setBarStr(String(w))}
                    className={`px-3 py-2 rounded-xl border border-white/10 ${parseNonNegFloat(barStr, 45)===w?"bg-indigo-600 text-white":"bg-white/10 hover:bg-white/15"}`}
                  >
                    {w} lb
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Plate Pairs Available</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setInventoryStr(Object.fromEntries(DEFAULT_PLATES.map((s) => [s, "0"])))}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={() => setInventoryStr(Object.fromEntries(DEFAULT_PLATES.map((s,i) => [s, String(4 - Math.min(i,2))])))}
                  className="px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-sm"
                >
                  Quick stock
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DEFAULT_PLATES.map((p) => (
                <div key={p} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: colorForSize(p) }} />
                      <span className="font-semibold">{p} lb</span>
                    </div>
                    <span className="text-xs text-slate-300">pairs</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inventoryStr[p] ?? "0"}
                    onChange={(e) => setInventoryStr((prev) => ({ ...prev, [p]: e.target.value }))}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      setInventoryStr((prev) => ({ ...prev, [p]: v === "" ? "0" : String(Math.max(0, parseNonNegInt(v, 0))) }));
                    }}
                    className="mt-2 w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-slate-300 text-sm">Bar {barWeight} + Plates = Target {target}</div>
              <div className="text-slate-200 text-sm">Total plates used: <span className="font-semibold">{totalPlates}</span></div>
            </div>
            {result.ok ? (
              <div className="mt-2 text-slate-100">Per side: {Object.keys(result.perSide).sort((a,b)=>b-a).map(Number).map((s)=>`${s}×${result.perSide[s]}`).join("  ·  ") || "(no plates)"}</div>
            ) : (
              <div className="mt-2 text-rose-300">No exact match with current inventory.</div>
            )}
          </div>
        </motion.div>

        {/* Visualization Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Visualization</h2>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span>Zoom</span>
              <input type="range" min={60} max={160} value={zoom} onChange={(e)=>setZoom(Number(e.target.value))} className="w-40" />
              <span className="tabular-nums">{zoom}%</span>
            </div>
          </div>
          <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
            <div style={{ transform: `scale(${zoom/100})`, transformOrigin: "top left" }}>
              <canvas ref={canvasRef} className="block" />
            </div>
          </div>

          {/* Color Key */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-200">Plate Color Key</h3>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEFAULT_PLATES.map((p) => (
                <div key={p} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: colorForSize(p) }} />
                  <span className="text-sm">{p} lb</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
