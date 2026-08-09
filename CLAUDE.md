# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow

**Never run `git push`.** The user pushes manually. Only commit locally.

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
  images/
    icon.ico               # Browser favicon
    icon_square.ico        # Square variant
  js/
    main.js                # App entry: nav, loadModule(), updateProgress()
    modules/               # One file per module — each exports a default HTML string
    interactive/           # One file per widget — each exports named functions
```

## Architecture

**CSS** — `public/css/main.css` is the static stylesheet. Edit it directly for style changes.

**Modules** — Each `public/js/modules/m*.js` exports a default template-literal HTML string. `main.js` imports all seventeen and stores them in `contentDB`. `loadModule(id)` injects `contentDB[id]` into `#content-container`.

**Interactive widgets** — Functions are exported from `public/js/interactive/`:
- `thermal.js` → `runThermalSim()` — thermal calculator sliders (Module 2)
- `hwChart.js` → `initHardwareChart()` — Chart.js bubble chart (Module 4)
- `dataBandwidth.js` → `calcDataBandwidth()` — video/IMU/MAVLink bandwidth calculator (Module 8)
- `swarm.js` → `initSwarm()`, `stopSwarm()` — Canvas Boids simulation (Module 15)
- `workflow.js` → `updateWorkflow(el, stepNum)` — implementation workflow stepper (Module 17)

`main.js` exposes `runThermalSim`, `initSwarm`, `updateWorkflow`, and `calcDataBandwidth` on `window` so onclick/oninput handlers embedded in module HTML strings can reach them. `initHardwareChart` and `stopSwarm` are **not** on `window` — they are called only from within `loadModule`.

**ES Modules** — `index.html` loads `main.js` as `<script type="module">`. All imports use explicit `.js` extensions and relative paths. No bundler, no package.json.

**CDN dependencies** (loaded in `index.html` — no npm install required):
- `chart.js@4.4.2` — used by `hwChart.js`
- `prism.js@1.29.0` + language packs: python, c, cpp, bash, json, yaml — syntax highlighting
- `katex@0.16.11` + its `auto-render` contrib script — math rendering (loaded with `defer`)

**Math notation** — modules write inline math as `\\(` … `\\)` in the JS source, which yields `\( … \)` in the emitted HTML string. `main.js` calls `renderMath()` after every module load, which invokes `renderMathInElement` with **only** `\(…\)` and `\[…\]` delimiters registered. Bare `$…$` is deliberately NOT a delimiter, because the hardware modules are full of dollar amounts (`~$249`, `$3,499`) that KaTeX would otherwise treat as math. Because KaTeX loads with `defer`, `renderMath()` retries every 100 ms (up to 20 times) until `window.renderMathInElement` exists.

**Escaping LaTeX in template literals** — inside a template literal, `\f`, `\b`, `\r`, `\t`, and `\v` are escape sequences, so writing `\frac` silently produces a formfeed character. **All TeX commands in module sources must use double backslashes** (`\\frac`, `\\partial`, `\\hat`). Only `m5_flightcontrol.js` and `m9_ekf.js` currently contain math.

## Key Conventions

- Module HTML strings use template literals; do not introduce `${...}` interpolation inside them (math notation uses `$...$` which is safe).
- `loadModule(id)` always calls `stopSwarm()` first to cancel any running Boids animation frame before swapping content.
- Widget init order inside `loadModule`:
  - `runThermalSim()` — called immediately when `m2_physics` loads
  - `initHardwareChart` — called via `setTimeout(..., 100)` when `m4_hardware` loads (DOM must settle for Chart.js)
  - `calcDataBandwidth()` — called immediately when `m8_systems` loads
  - `initSwarm` — called via `setTimeout(..., 100)` when `m15_swarms` loads
  - `updateWorkflow(null, 1)` — called immediately when `m17_workflow` loads
- `window.loadModule` is global because it is called from the mobile `<select onchange="loadModule(this.value)">` in `index.html`. `window.updateProgress` is also global (called internally by `loadModule`).
- Prism.js is re-triggered after each module load via `if (window.Prism) setTimeout(() => Prism.highlightAll(), 50)`.
- Boids canvas width is set to `parentElement.clientWidth - 64`; the resize listener re-calls `initSwarm()` when Module 15 (`m15_swarms`) is active.
- All paths in `index.html` are relative (no leading `/`) so the site works on GitHub Pages sub-paths.
