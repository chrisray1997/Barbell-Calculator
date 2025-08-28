const { useEffect, useRef } = React;

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

    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(barX, centerY - barH / 2, barLength, barH);
    ctx.fillStyle = "#6b7280";
    for (let x = barX + 40; x < barX + barLength - 40; x += 10) ctx.fillRect(x, centerY - 4, 3, 8);

    const leftSleeveStart = barX + 30;
    const rightSleeveEnd = barX + barLength - 30;
    ctx.fillStyle = "#d1d5db";
    ctx.fillRect(leftSleeveStart, centerY - 24, sleeveLength, 48);
    ctx.fillRect(rightSleeveEnd - sleeveLength, centerY - 24, sleeveLength, 48);

    const sideSizes = Object.keys(perSide).map(Number).sort((a, b) => a - b);
    // Increase base gap for better visual separation, especially for small plates
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
          // Provide additional gap for small plates so their labels don't crowd
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

          const label = String(size);
          ctx.font = "900 38px ui-sans-serif, system-ui, -apple-system";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const tw = ctx.measureText(label).width;
          const padX = 14, padY = 9;
          const badgeW = Math.max(tw + padX * 2, thickness - 6);
          const badgeH = 50;
          const cx = x + thickness / 2;
          const cy = y + height / 2;
          const bx = cx - badgeW / 2;
          const by = cy - badgeH / 2;

          ctx.save();
          rr(ctx, bx, by, badgeW, badgeH, 8);
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(255,255,255,0.25)";
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#fff";
          ctx.fillText(label, cx, cy + 1);

          accumulated += thickness + gap;
        }
      });

      const collarW = 18;
      const collarH = 240;
      const cx = isLeft ? leftSleeveStart + accumulated + 8 : rightSleeveEnd - accumulated - 8 - collarW;
      const cy = centerY - collarH / 2;
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(cx, cy, collarW, collarH);
    };

    drawSide(true);
    drawSide(false);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "600 28px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText(`Bar: ${barWeight} lb`, 16, 44);
  }, [perSide, barWeight]);

  return canvasRef;
}
