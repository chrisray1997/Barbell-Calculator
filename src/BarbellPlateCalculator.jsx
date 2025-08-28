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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 flex items-start justify-center p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-2 gap-8">
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
        <Visualization canvasRef={canvasRef} />
      </div>
    </div>
  );
}
