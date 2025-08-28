# Barbell Plate Calculator

A light, single‑page tool to compute and visualize barbell plate layouts. Built intentionally as a “vibe coded” project — fast iteration, minimal tooling, and lots of small UX refinements guided by feel rather than a strict spec.

## What’s New (Recent Improvements)

- Mobile layout: Visualization appears first and stays sticky while you scroll inputs; on large screens it moves to the right of the controls.
- Readability: Plate labels use dynamic sizing, auto‑contrast text (light/dark with outline), and a compact badge on thin plates (5 lb, 2.5 lb) for crystal‑clear numbers.
- Clean canvas: Removed the top‑left bar label and refined spacing for small plates so labels don’t clash.
- Accessibility: Larger touch targets (≥44px), focus‑visible rings, improved semantics, and polite live updates in the summary.
- Viewport polish: `viewport-fit=cover` and a `theme-color` for better behavior on iOS and modern mobile browsers.

## Stack

- React 18 (UMD) + ReactDOM (UMD) loaded via CDN in `index.html` — no build step.
- Babel Standalone compiles external JSX modules in the browser for quick iteration.
- Tailwind CSS (CDN) for layout and styling primitives.
- Framer Motion (UMD) surface, wrapped in a tiny helper so the UI can gracefully animate without coupling to a bundler.
- Canvas 2D API for the visualization; pure JS drawing with our own layout/contrast logic.
- LocalStorage for state persistence (target, bar, inventory) and a “Quick Stock” preset.

Key files
- `index.html` — CDN imports, safe fallback message if opened via `file://`.
- `src/BarbellPlateCalculator.jsx` — App shell and responsive layout ordering.
- `src/Controls.jsx` — Inputs, presets, summary, and a11y improvements.
- `src/Visualization.jsx` — Sticky card wrapper for the canvas on mobile.
- `src/useCanvasDraw.js` — Canvas renderer: bar, sleeves, plates, labels.
- `src/utils.js` — Greedy layout algorithm, storage helpers, Motion shim, colors.

## Run Locally (no build step)

Important: run via a local server
- This page uses Babel Standalone to compile external JSX files at runtime. Browsers block loading those files when opening `index.html` via `file://`, which results in a blank screen.
- Start a local static server from the project root, then open the served URL in your browser.

Quick start options
- Python 3: `python3 -m http.server 5173` then visit `http://localhost:5173`
- Node (http-server): `npx http-server -p 5173` then visit `http://localhost:5173`
- VS Code: use the Live Server extension

Once served, open `index.html` at the local URL and the app will render.

## Using The App

- Enter a target and bar weight; the greedy solver allocates plates heaviest to lightest by available pairs.
- Adjust the “Plate Pairs Available” inventory or use “Apply Quick Stock”.
- The canvas updates instantly; per‑side breakdown and total plates are summarized below the controls.

## Design Notes (Vibe Coded)

- The project favors direct browser development with CDN scripts to maximize iteration speed and keep the stack approachable.
- Visual choices are pragmatic: label outlines and dynamic font sizes maintain legibility across colors and small plate widths without adding dependencies.
- Responsive behavior emphasizes a single‑pane mobile experience: canvas first and sticky; controls follow. On wide screens, the canvas shifts right for a familiar desktop layout.

## Deploy to GitHub Pages

This project is pure static HTML/JS/CSS, so it can be published directly with GitHub Pages. A workflow is included.

Steps
- Push the repo to GitHub.
- In the GitHub UI, go to Settings → Pages.
- Under Build and deployment, set Source to “GitHub Actions”.
- Ensure your default branch is `main` or `master` (the workflow listens to both).
- Push to your default branch; the `Deploy to GitHub Pages` workflow will build and publish.

Notes
- `.nojekyll` is included to disable Jekyll processing.
- All script paths are relative, so hosting under `/<repo-name>/` works without changes.
- If you use a custom domain, add a `CNAME` file at the repo root with your domain.
