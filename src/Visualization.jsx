function Visualization({ canvasRef, zoom, setZoom }) {
  return (
    <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Visualization</h2>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span>Zoom</span>
          <input type="range" min={60} max={160} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-40" />
          <span className="tabular-nums">{zoom}%</span>
        </div>
      </div>
      <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
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
    </Motion.div>
  );
}

