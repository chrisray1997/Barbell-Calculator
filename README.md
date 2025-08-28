# Barbell Plate Calculator

A simple React-based tool for visualizing barbell plate layouts. The project now uses small utility and component files instead of a single large JSX file.

Important: run via a local server
- This page uses Babel Standalone to compile external JSX files at runtime. Browsers block loading those files when opening `index.html` via `file://`, which results in a blank screen.
- Start a local static server from the project root, then open the served URL in your browser.

Quick start options
- Python 3: `python3 -m http.server 5173` then visit `http://localhost:5173`
- Node (http-server): `npx http-server -p 5173` then visit `http://localhost:5173`
- VS Code: use the Live Server extension

Once served, open `index.html` at the local URL and the app will render.
