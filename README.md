# sUAS Edge AI & Autonomous Systems — Engineering Masterclass

An interactive, self-paced study guide for engineers building AI-powered small Unmanned Aircraft Systems (sUAS). The curriculum covers the full stack: from the physics of flight and embedded silicon, through perception and sensor fusion, to swarm coordination and counter-UAS security.

Both sides of the field are covered — commercial and industrial operations (inspection, delivery, survey, public safety, and the Part 108 BVLOS transition) alongside contested-environment and defense engineering (EW resilience, GNSS-denied navigation, Blue UAS compliance).

**Live site:** https://romankalinchuk.github.io/sUAS-AI-StudyGuide

**Content currency:** technical claims, versions, and regulatory status were last reviewed against primary sources in **August 2026**. Fast-moving areas — FAA Part 108 rulemaking, FCC Covered List exemptions, the Blue UAS Cleared List, and NVIDIA/ROS release cadence — should be re-verified before you rely on them.

---

## What's inside

17 modules:

| # | Module | Topics |
|---|--------|--------|
| 1 | Fundamentals & Autonomy | Autonomy levels, OODA loop, edge vs. cloud AI, Part 107/108, Blue UAS, commercial market |
| 2 | SWaP-C Physics & Math | Momentum theory, blade element theory, disk loading, thermal design, endurance math |
| 3 | Power Electronics & Circuits | Battery chemistry, semi-solid-state cells, ESC firmware, BECs, power distribution |
| 4 | Compute Silicon Matrix | Jetson Orin Super & Thor, Hailo, RK3588, flight controllers, cameras, LiDAR, GNSS |
| 5 | Flight Controller Architecture | Cascaded PID, EKF, flight modes, MAVLink/uXRCE-DDS, PX4 vs. ArduPilot |
| 6 | RF Communications & Link Mgmt | Link budgets, ExpressLRS, FHSS/DSSS, fiber-optic control links, mesh, SDR |
| 7 | Edge Software Toolchains | TensorRT, ONNX Runtime, ROS 2 LTS selection, Isaac ROS, containers, real-time Linux |
| 8 | Data Links & Topology | MIPI CSI-2, CAN/DroneCAN, video pipelines, time sync, bandwidth budgeting |
| 9 | Sensor Fusion & EKF | EKF derivation, UKF and ESKF variants, EKF3 state vector, delayed-measurement handling |
| 10 | AI Training & Dataset Pipeline | Dataset curation, transfer learning, YOLO26, quantization, TensorRT engines |
| 11 | Perception & VSLAM | Detection, tracking, thermal IR, camera geometry, VIO, geometric foundation models |
| 12 | Depth Sensing & 3D Mapping | Stereo, ToF, LiDAR, FAST-LIO2, nvblox, 3D Gaussian Splatting |
| 13 | Path Planning & Navigation | A*, D* Lite, SMAC, MPPI, minimum-snap trajectories, GNSS-denied fallback, RTK |
| 14 | AI Targeting & Kinematics | Object tracking, pursuit kinematics, gimbal control, human-in-the-loop constraints |
| 15 | Swarm Intelligence | Boids, consensus protocols, task allocation, mesh coordination, program realities |
| 16 | Security & Counter-UAS | MAVLink signing, GPS spoofing, secure boot, adversarial ML, C-UAS, NDAA/FCC compliance |
| 17 | Implementation Workflow | End-to-end build checklist, integration steps |

### Interactive elements

- **Thermal estimator** — models case temperature vs. processor power, ambient, and airflow, against the 80 °C Jetson case limit (Module 2)
- **Hardware comparison chart** — bubble chart of AI performance vs. cost vs. power across GPU/NPU/SoC/FPGA options (Module 4)
- **Data bandwidth calculator** — raw CSI-2 sensor load and compressed downlink bitrate, with interface recommendations (Module 8)
- **Live Boids swarm simulation** — tune separation, alignment, and cohesion in real time (Module 15)
- **Implementation workflow stepper** — guided build process with expandable steps (Module 17)

---

## Running locally

The site uses ES modules, so it requires an HTTP server (browsers block `file://` imports). Any static server pointed at the `public/` directory works:

```bash
# Python (no install needed)
cd public && python3 -m http.server 8080

# Node.js npx
npx serve public
```

Then open `http://localhost:8080` in your browser.

There is no build step, no bundler, and no `package.json`. Third-party libraries (Chart.js, Prism, KaTeX) load from CDNs at runtime, so a network connection is needed for syntax highlighting, the hardware chart, and math rendering.

---

## Deployment

Pushing to `main` automatically deploys the `public/` directory to GitHub Pages via `.github/workflows/deploy.yml`.

To enable Pages on a fresh fork:
1. Go to **Settings → Pages**
2. Set Source to **GitHub Actions**

---

## Contributing corrections

This material makes a lot of specific, checkable claims — part counts, power figures, release dates, regulatory deadlines. If you find one that is wrong or has gone stale, corrections are welcome. Claims sourced to a vendor datasheet, a standards document, or a primary regulatory filing are preferred over secondary reporting.
