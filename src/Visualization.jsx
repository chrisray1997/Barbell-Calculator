function Visualization({ canvasRef }) {
  return (
    <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col self-start lg:sticky lg:top-2 lg:z-10">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-semibold">Visualization</h2>
      </div>
      <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
        <canvas
          ref={canvasRef}
          className="block w-full h-auto"
          style={{ display: 'block', width: '100%', height: 'auto', transform: 'translateZ(0)' }}
        />
      </div>

      {/* Color Key */}
      <div className="mt-3 mb-1">
        <h3 className="text-sm font-semibold text-slate-200">Plate Color Key</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEFAULT_PLATES.map((p) => (
            <div key={p} className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1.5 text-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorForSize(p) }} />
              <span>{p} lb</span>
            </div>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}
