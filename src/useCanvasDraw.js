const { useEffect, useRef } = React;

// Color utilities to choose high-contrast text colors per plate
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function relLuma({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

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

    // Use a larger drawing buffer for crisper scaling and full-bar view
    const W = (canvas.width = 1800);
    const H = (canvas.height = 560);

    // Dark gradient background (original style)
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

    // Horizontal bar and knurl
    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(barX, centerY - barH / 2, barLength, barH);
    ctx.fillStyle = "#6b7280";
    for (let x = barX + 40; x < barX + barLength - 40; x += 10) ctx.fillRect(x, centerY - 4, 3, 8);

    // Sleeves
    const leftSleeveStart = barX + 30;
    const rightSleeveEnd = barX + barLength - 30;
    ctx.fillStyle = "#d1d5db";
    ctx.fillRect(leftSleeveStart, centerY - 24, sleeveLength, 48);
    ctx.fillRect(rightSleeveEnd - sleeveLength, centerY - 24, sleeveLength, 48);

    const sideSizes = Object.keys(perSide).map(Number).sort((a, b) => a - b);
    // Base gap for plate separation (original feel)
    const baseGap = 28;

    const drawSide = (isLeft) => {
      let accumulated = 0;
      sideSizes.forEach((size) => {
        const count = perSide[size] || 0;
        for (let i = 0; i < count; i++) {
          const idx = DEFAULT_PLATES.indexOf(size);
          const color = COLORS[(idx >= 0 ? idx : 0) % COLORS.length];
          const thickness = Math.max(16, Math.min(56, size));
          const height = 220 + Math.min(150, size * 4);
          const y = centerY - height / 2;
          const extraGap = size <= 2.5 ? 22 : size <= 5 ? 18 : size <= 10 ? 14 : size <= 25 ? 10 : 6;
          const gap = baseGap + extraGap;
          const x = isLeft ? leftSleeveStart + 8 + accumulated : rightSleeveEnd - 8 - accumulated - thickness;

          // Plate body with subtle inner shadow and outer stroke to separate plates
          ctx.fillStyle = color;
          ctx.fillRect(x, y, thickness, height);
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.fillRect(x + 3, y + 10, thickness - 6, height - 20);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.strokeRect(x + 0.5, y + 0.5, thickness - 1, height - 1);

          // Label centered on the plate with auto-contrast and dynamic size
          const label = String(size);
          const minFs = 28, maxFs = 46;
          const t = Math.max(0, Math.min(1, (height - 220) / 150));
          const fs = Math.round(minFs + (maxFs - minFs) * t);
          ctx.font = `900 ${fs}px ui-sans-serif, system-ui, -apple-system`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const cx = x + thickness / 2;
          const cy = y + height / 2;

          // Auto-contrast selection based on plate brightness
          const rgb = hexToRgb(color);
          const effectiveLuma = relLuma(rgb) * 0.65; // inner shadow makes plate darker
          const useDarkText = effectiveLuma > 0.55;
          const textFill = useDarkText ? "#0b0f19" : "#ffffff";
          const outline = useDarkText ? "rgba(255,255,255,0.98)" : "rgba(0,0,0,0.92)";
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          let lw = Math.max(6, Math.round(fs / 3));

          // For very thin plates (e.g., 5 lb and 2.5 lb), add a compact
          // high-contrast badge behind the text to boost legibility.
          if (thickness <= 24) {
            const padX = 8;
            const badgeW = Math.max(thickness + padX * 2, fs * 1.2);
            const badgeH = Math.round(fs * 1.05);
            const bx = cx - badgeW / 2;
            const by = cy - badgeH / 2;
            ctx.save();
            rr(ctx, bx, by, badgeW, badgeH, 8);
            ctx.fillStyle = useDarkText ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.7)";
            ctx.fill();
            ctx.restore();
            lw = Math.max(lw, 4);
          }

          ctx.lineWidth = lw;
          ctx.strokeStyle = outline;
          ctx.strokeText(label, cx, cy + 1);
          ctx.fillStyle = textFill;
          ctx.fillText(label, cx, cy + 1);

          accumulated += thickness + gap;
        }
      });

      // Collars at the ends of the plates
      const collarW = 18;
      const collarH = 240;
      const cx = isLeft ? leftSleeveStart + accumulated + 8 : rightSleeveEnd - accumulated - 8 - collarW;
      const cy = centerY - collarH / 2;
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(cx, cy, collarW, collarH);
    };

    drawSide(true);
    drawSide(false);

    // No top-left bar label
  }, [perSide, barWeight]);

  return canvasRef;
}
