
function Controls({
  targetStr,
  setTargetStr,
  barStr,
  setBarStr,
  inventoryStr,
  setInventoryStr,
  barWeight,
  target,
  result,
  totalPlates,
  handleNumberInput,
  commitNonNeg,
}) {
  return (
    <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Barbell Plate Calculator</h1>
          <p className="text-slate-300 text-sm mt-1">Heaviest plates inside, small plates on the outside. Crisp canvas labels.</p>
        </div>
      </div>

      {/* Target & Bar */}
      <div className="mt-4 grid grid-cols-1 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Target Weight (lb)</span>
          <input
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            value={targetStr}
            onChange={handleNumberInput(setTargetStr)}
            onBlur={commitNonNeg(setTargetStr, 0)}
            className="bg-white/10 border border-white/10 rounded-xl px-3 py-3 min-h-[44px] text-base outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            placeholder="e.g. 225"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-300">Bar Weight (lb)</span>
            <input
              type="text"
              inputMode="decimal"
              enterKeyHint="done"
              autoComplete="off"
              value={barStr}
              onChange={handleNumberInput(setBarStr)}
              onBlur={commitNonNeg(setBarStr, 45)}
              className="bg-white/10 border border-white/10 rounded-xl px-3 py-3 min-h-[44px] text-base outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              placeholder="45"
            />
          </label>
          <div className="flex gap-2 flex-wrap">
            {[45].map((w) => (
              <button
                key={w}
                onClick={() => setBarStr(String(w))}
                className={`px-3 py-2.5 min-h-[40px] rounded-lg border border-white/10 text-sm ${parseNonNegFloat(barStr, 45) === w ? "bg-amber-600 text-white" : "bg-white/10 hover:bg-white/15"}`}
              >
                {w} lb
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="mt-4">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
          <h2 className="text-lg font-semibold">Plate Pairs Available</h2>
          <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
            <button
              onClick={() => setInventoryStr(Object.fromEntries(DEFAULT_PLATES.map((s) => [s, "0"]))) }
              className="px-3 py-2.5 min-h-[44px] w-full sm:w-auto rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
            >
              Clear
            </button>
            <button
              onClick={() => {
                const preset = typeof loadQuickStock === 'function' ? loadQuickStock() : Object.fromEntries(DEFAULT_PLATES.map((s, i) => [s, String(4 - Math.min(i, 2))]));
                setInventoryStr(preset);
              }}
              className="px-3 py-2.5 min-h-[44px] w-full sm:w-auto rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-sm"
            >
              Apply Quick Stock
            </button>
            <button
              onClick={() => {
                if (typeof saveQuickStock === 'function') saveQuickStock(inventoryStr);
              }}
              className="px-3 py-2.5 min-h-[44px] w-full sm:w-auto rounded-lg bg-amber-600/90 hover:bg-amber-600 text-sm"
            >
              Save Quick Stock
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DEFAULT_PLATES.map((p) => (
            <div key={p} className="rounded-xl border border-white/10 bg-white/5 p-3">
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
                enterKeyHint="done"
                autoComplete="off"
                value={inventoryStr[p] ?? "0"}
                onChange={(e) => setInventoryStr((prev) => ({ ...prev, [p]: e.target.value }))}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  setInventoryStr((prev) => ({ ...prev, [p]: v === "" ? "0" : String(Math.max(0, parseNonNegInt(v, 0))) }));
                }}
                className="mt-2 w-full bg-white/10 border border-white/10 rounded-xl px-3 py-3 min-h-[44px] text-base outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-slate-300 text-sm">Bar {barWeight} + Plates = Target {target}</div>
          <div className="text-slate-200 text-sm">Total plates used: <span className="font-semibold">{totalPlates}</span></div>
        </div>
        {result.ok ? (
          <div className="mt-2 text-slate-100" aria-live="polite">
            Per side: {Object.keys(result.perSide).sort((a, b) => b - a).map(Number).map((s) => `${s}×${result.perSide[s]}`).join("  ·  ") || "(no plates)"}
          </div>
        ) : (
          <div className="mt-2 text-rose-300" aria-live="polite">No exact match with current inventory.</div>
        )}
      </div>
    </Motion.div>
  );
}
