const { useMemo, useState, useEffect } = React;

function BarbellPlateCalculator() {
  const saved = typeof loadSavedState === 'function' ? loadSavedState() : null;
  const [targetStr, setTargetStr] = useState(saved?.targetStr ?? "225");
  const [barStr, setBarStr] = useState(saved?.barStr ?? "45");
  const [inventoryStr, setInventoryStr] = useState(() => saved?.inventoryStr ?? Object.fromEntries(DEFAULT_PLATES.map((s) => [s, "4"])));

  const target = useMemo(() => parseNonNegFloat(targetStr, 0), [targetStr]);
  const barWeight = useMemo(() => parseNonNegFloat(barStr, 45), [barStr]);
  const inventory = useMemo(() => {
    const obj = {};
    for (const s of DEFAULT_PLATES) obj[s] = parseNonNegInt(inventoryStr[s] ?? 0, 0);
    return obj;
  }, [inventoryStr]);

  const result = useMemo(() => computeLayout({ target, bar: barWeight, inventory }), [target, barWeight, inventory]);
  const canvasRef = useCanvasDraw(result.ok ? result.perSide : {}, barWeight);
  const totalPlates = useMemo(() => Object.entries(result.ok ? result.perSide : {}).reduce((acc, [_, c]) => acc + c * 2, 0), [result]);

  // Persist key state to localStorage
  useEffect(() => {
    if (typeof saveState === 'function') {
      saveState({ targetStr, barStr, inventoryStr });
    }
  }, [targetStr, barStr, inventoryStr]);

  const handleNumberInput = (setter) => (e) => {
    setter(e.target.value);
  };
  const commitNonNeg = (setter, fallback) => (e) => {
    const v = e.target.value.trim();
    if (v === "") setter(String(fallback));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900 text-slate-100 flex items-start justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* Show visualization first on mobile; side-by-side on xl */}
        <div className="order-1 lg:order-2">
          <Visualization canvasRef={canvasRef} />
        </div>
        <div className="order-2 lg:order-1">
        <Controls
          targetStr={targetStr}
          setTargetStr={setTargetStr}
          barStr={barStr}
          setBarStr={setBarStr}
          inventoryStr={inventoryStr}
          setInventoryStr={setInventoryStr}
          barWeight={barWeight}
          target={target}
          result={result}
          totalPlates={totalPlates}
          handleNumberInput={handleNumberInput}
          commitNonNeg={commitNonNeg}
        />
        </div>
      </div>
    </div>
  );
}
