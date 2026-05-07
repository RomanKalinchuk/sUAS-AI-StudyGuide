# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Hosting

This is a fully static site deployed to GitHub Pages via `.github/workflows/deploy.yml`.
Pushing to `main` automatically deploys `public/` to GitHub Pages.

To enable GitHub Pages the first time:
1. Go to repo Settings → Pages
2. Set Source to **GitHub Actions**

## Project Structure

```
public/
  index.html               # Shell HTML — no inline styles or scripts
  css/main.css             # Static CSS (edit directly; Tailwind tooling removed)
  js/
    main.js                # App entry: nav, loadModule(), updateProgress()
    modules/               # One file per module — each exports a default HTML string
    interactive/           # One file per widget — each exports named functions
```

## Architecture

**CSS** — `public/css/main.css` is the static stylesheet. Edit it directly for style changes.

**Modules** — Each `public/js/modules/m*.js` exports a default template-literal HTML string. `main.js` imports all seventeen and stores them in `contentDB`. `loadModule(id)` injects `contentDB[id]` into `#content-container`.

**Interactive widgets** — Functions are exported from `public/js/interactive/`:
- `thermal.js` → `runThermalSim()` — thermal calculator sliders
- `hwChart.js` → `initHardwareChart()` — Chart.js bubble chart
- `swarm.js` → `initSwarm()` — Canvas Boids simulation
- `workflow.js` → `updateWorkflow(el, stepNum)` + `workflowContent` object

`main.js` imports these and attaches them to `window` so onclick handlers inside module HTML strings can reach them.

**ES Modules** — `index.html` loads `main.js` as `<script type="module">`. All imports use explicit `.js` extensions and relative paths. No bundler.

## Key Conventions

- Module HTML strings use template literals; do not introduce `${...}` interpolation inside them (math notation uses `$...$` which is safe).
- `loadModule` calls widget init functions after injection: `runThermalSim()` immediately, `initHardwareChart` / `initSwarm` via `setTimeout(..., 100)` to let the DOM settle.
- `window.loadModule` and `window.updateProgress` are global because they are referenced from `onchange`/`onscroll` attributes in `index.html`.
- Prism.js is re-triggered with `Prism.highlightAll()` after each module load.
- Boids canvas width is set to `parentElement.clientWidth - 64`; the resize listener re-calls `initSwarm()` when Module 7 is active.
- All paths in `index.html` are relative (no leading `/`) so the site works on GitHub Pages sub-paths.
