const DEFAULT_PLATES = [45, 35, 25, 10, 5, 2.5];
const COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6", "#22d3ee"];

const Motion = (() => {
  const fm = window.framerMotion || window.FramerMotion || window.motion || window.Motion;
  if (fm && fm.motion) return fm.motion;
  const make = (tag) => (props) => React.createElement(tag, props, props.children);
  return { div: make("div") };
})();

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

const colorForSize = (size) => COLORS[DEFAULT_PLATES.indexOf(size) % COLORS.length];

