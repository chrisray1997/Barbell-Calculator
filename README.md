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
